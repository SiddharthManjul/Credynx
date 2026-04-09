import { Octokit } from '@octokit/rest';
import { prisma } from '@/lib/server/prisma';
import { HttpError } from '@/lib/server/http';

export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  languages_url: string;
  topics: string[];
  is_fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubStats {
  profile: GitHubProfile;
  repositories: GitHubRepository[];
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  pullRequests: number;
  followers: number;
  languages: Record<string, number>;
  contributionScore: number;
}

export interface RepositoryValidation {
  isValid: boolean;
  isPublic: boolean;
  exists: boolean;
  stars: number;
  forks: number;
  language: string;
  message?: string;
}

let octokitInstance: Octokit | null = null;
function getOctokit(): Octokit {
  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    });
  }
  return octokitInstance;
}

function extractGitHubUsername(githubUrl: string): string | null {
  const match = githubUrl.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

function calculateContributionScore(metrics: {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  followers: number;
}): number {
  const { totalRepos, totalStars, totalForks, followers } = metrics;
  const repoScore = Math.min((totalRepos / 20) * 25, 25);
  const starScore = Math.min((totalStars / 100) * 30, 30);
  const forkScore = Math.min((totalForks / 50) * 20, 20);
  const followerScore = Math.min((followers / 50) * 25, 25);
  return Math.round((repoScore + starScore + forkScore + followerScore) * 10) / 10;
}

export const githubService = {
  async getGitHubProfile(username: string): Promise<GitHubProfile> {
    try {
      const { data } = await getOctokit().users.getByUsername({ username });
      return {
        login: data.login,
        name: data.name || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new HttpError(404, 'GitHub user not found');
      }
      throw new HttpError(500, 'Failed to fetch GitHub profile');
    }
  },

  async getGitHubRepositories(username: string): Promise<GitHubRepository[]> {
    try {
      const allRepos: GitHubRepository[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data } = await getOctokit().repos.listForUser({
          username,
          type: 'owner',
          sort: 'updated',
          per_page: 100,
          page,
        });

        if (data.length === 0) {
          hasMore = false;
        } else {
          const repos = data.map((repo) => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || '',
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count || 0,
            forks_count: repo.forks_count || 0,
            language: repo.language || '',
            languages_url: repo.languages_url,
            topics: repo.topics || [],
            is_fork: repo.fork,
            created_at: repo.created_at || '',
            updated_at: repo.updated_at || '',
            pushed_at: repo.pushed_at || '',
          }));

          allRepos.push(...repos);

          if (data.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      return allRepos;
    } catch {
      throw new HttpError(500, 'Failed to fetch GitHub repositories');
    }
  },

  async getTotalCommits(username: string): Promise<number> {
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 365);

      const fromDateISO = fromDate.toISOString();
      const toDateISO = toDate.toISOString();

      const query = `
        query {
          user(login: "${username}") {
            contributionsCollection(from: "${fromDateISO}", to: "${toDateISO}") {
              contributionCalendar {
                totalContributions
              }
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
          }
        }
      `;

      const response: any = await getOctokit().graphql(query);
      return response.user.contributionsCollection.contributionCalendar.totalContributions || 0;
    } catch {
      return 0;
    }
  },

  async getTotalPullRequests(username: string): Promise<number> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 365);
      const startDate = fromDate.toISOString().split('T')[0];

      const { data } = await getOctokit().search.issuesAndPullRequests({
        q: `author:${username} type:pr created:>=${startDate}`,
        per_page: 1,
      });

      return data.total_count || 0;
    } catch {
      return 0;
    }
  },

  async getGitHubStats(username: string): Promise<GitHubStats> {
    const profile = await this.getGitHubProfile(username);
    const repositories = await this.getGitHubRepositories(username);

    const [totalCommits, pullRequests] = await Promise.all([
      this.getTotalCommits(username),
      this.getTotalPullRequests(username),
    ]);

    const ownRepos = repositories.filter((repo) => !repo.is_fork);

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);

    const languages: Record<string, number> = {};
    ownRepos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const contributionScore = calculateContributionScore({
      totalRepos: ownRepos.length,
      totalStars,
      totalForks,
      followers: profile.followers,
    });

    return {
      profile,
      repositories: ownRepos,
      publicRepos: profile.public_repos,
      totalStars,
      totalForks,
      totalCommits,
      pullRequests,
      followers: profile.followers,
      languages,
      contributionScore,
    };
  },

  async validateRepository(repositoryUrl: string): Promise<RepositoryValidation> {
    try {
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return {
          isValid: false,
          isPublic: false,
          exists: false,
          stars: 0,
          forks: 0,
          language: '',
          message: 'Invalid GitHub repository URL format',
        };
      }

      const [, owner, repo] = match;
      const { data } = await getOctokit().repos.get({
        owner,
        repo: repo.replace('.git', ''),
      });

      return {
        isValid: true,
        isPublic: !data.private,
        exists: true,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language || '',
        message: 'Repository is valid and accessible',
      };
    } catch (error: any) {
      if (error.status === 404) {
        return {
          isValid: false,
          isPublic: false,
          exists: false,
          stars: 0,
          forks: 0,
          language: '',
          message: 'Repository not found or is private',
        };
      }
      throw new HttpError(500, 'Failed to validate repository');
    }
  },

  async syncDeveloperGitHubData(developerId: string) {
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      include: { projects: true },
    });

    if (!developer) {
      throw new HttpError(404, 'Developer not found');
    }

    if (!developer.github) {
      throw new HttpError(400, 'Developer has no GitHub profile linked');
    }

    const username = extractGitHubUsername(developer.github);
    if (!username) {
      throw new HttpError(400, 'Invalid GitHub URL format');
    }

    const stats = await this.getGitHubStats(username);

    for (const project of developer.projects) {
      if (project.repositoryUrl) {
        const validation = await this.validateRepository(project.repositoryUrl);
        if (validation.isValid) {
          await prisma.project.update({
            where: { id: project.id },
            data: {
              githubStars: validation.stars,
              githubForks: validation.forks,
            },
          });
        }
      }
    }

    await prisma.openSourceContribution.upsert({
      where: { id: developer.id },
      update: {
        repositoryUrl: stats.profile.html_url,
        repositoryName: username,
        contributionType: 'GITHUB_PROFILE',
        contributionCount: stats.totalStars + stats.totalForks,
        impactScore: stats.contributionScore,
        lastSyncedAt: new Date(),
      },
      create: {
        id: developer.id,
        developer: { connect: { id: developerId } },
        repositoryUrl: stats.profile.html_url,
        repositoryName: username,
        contributionType: 'GITHUB_PROFILE',
        contributionCount: stats.totalStars + stats.totalForks,
        impactScore: stats.contributionScore,
        lastSyncedAt: new Date(),
      },
    });

    return {
      message: 'GitHub data synced successfully',
      stats: {
        publicRepos: stats.publicRepos,
        totalStars: stats.totalStars,
        totalForks: stats.totalForks,
        totalCommits: stats.totalCommits,
        pullRequests: stats.pullRequests,
        followers: stats.followers,
        contributionScore: stats.contributionScore,
        languages: stats.languages,
      },
    };
  },
};
