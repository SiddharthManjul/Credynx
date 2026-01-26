import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { PrismaService } from '../lib/prisma.service.js';

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

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private octokit: Octokit;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const githubToken = this.configService.get<string>(
      'GITHUB_PERSONAL_ACCESS_TOKEN',
    );

    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  /**
   * Fetch GitHub profile information
   */
  async getGitHubProfile(username: string): Promise<GitHubProfile> {
    try {
      const { data } = await this.octokit.users.getByUsername({
        username,
      });

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
      this.logger.error(`Failed to fetch GitHub profile for ${username}`, error);
      if (error.status === 404) {
        throw new HttpException(
          'GitHub user not found',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to fetch GitHub profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch all public repositories for a user (with pagination)
   */
  async getGitHubRepositories(username: string): Promise<GitHubRepository[]> {
    try {
      const allRepos: GitHubRepository[] = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const { data } = await this.octokit.repos.listForUser({
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

          // If we got less than 100, we've reached the end
          if (data.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      return allRepos;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch repositories for ${username}`,
        error,
      );
      throw new HttpException(
        'Failed to fetch GitHub repositories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get total contributions from GitHub GraphQL API (most accurate)
   * Fetches contributions from the past 365 days (rolling 12-month window)
   */
  async getTotalCommits(username: string): Promise<number> {
    try {
      // Calculate dates for past 365 days
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 365);

      // Format dates for GitHub API (ISO 8601)
      const fromDateISO = fromDate.toISOString();
      const toDateISO = toDate.toISOString();

      this.logger.log(`Fetching commits for ${username} from ${fromDateISO} to ${toDateISO}`);

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

      const response: any = await this.octokit.graphql(query);
      const contributions = response.user.contributionsCollection;

      // Log detailed breakdown for debugging
      this.logger.log(`GitHub contributions for ${username}:`, {
        totalContributions: contributions.contributionCalendar.totalContributions,
        commits: contributions.totalCommitContributions,
        issues: contributions.totalIssueContributions,
        pullRequests: contributions.totalPullRequestContributions,
        reviews: contributions.totalPullRequestReviewContributions,
      });

      // Return total contributions (includes all activity types)
      return contributions.contributionCalendar.totalContributions || 0;
    } catch (error: any) {
      this.logger.warn(`Failed to fetch contributions for ${username}`, error);
      return 0;
    }
  }

  /**
   * Get total pull request count for a user (past 365 days)
   * Uses a rolling 12-month window instead of calendar year
   */
  async getTotalPullRequests(username: string): Promise<number> {
    try {
      // Calculate date 365 days ago
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 365);

      // Format as YYYY-MM-DD for GitHub search API
      const startDate = fromDate.toISOString().split('T')[0];

      const { data } = await this.octokit.search.issuesAndPullRequests({
        q: `author:${username} type:pr created:>=${startDate}`,
        per_page: 1,
      });

      return data.total_count || 0;
    } catch (error: any) {
      this.logger.warn(`Failed to fetch PR count for ${username}`, error);
      return 0;
    }
  }

  /**
   * Get comprehensive GitHub statistics for a user
   */
  async getGitHubStats(username: string): Promise<GitHubStats> {
    const profile = await this.getGitHubProfile(username);
    const repositories = await this.getGitHubRepositories(username);

    // Get total commits and PRs (past 365 days)
    const [totalCommits, pullRequests] = await Promise.all([
      this.getTotalCommits(username),
      this.getTotalPullRequests(username),
    ]);

    // Filter out forked repositories for contribution score calculation
    const ownRepos = repositories.filter((repo) => !repo.is_fork);

    // Calculate total stars and forks from ALL repos (including forks)
    // This matches what users see on their GitHub profile
    const totalStars = repositories.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0,
    );
    const totalForks = repositories.reduce(
      (sum, repo) => sum + repo.forks_count,
      0,
    );

    // Get language distribution
    const languages: Record<string, number> = {};
    ownRepos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Calculate contribution score
    const contributionScore = this.calculateContributionScore({
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
  }

  /**
   * Validate a GitHub repository URL
   */
  async validateRepository(
    repositoryUrl: string,
  ): Promise<RepositoryValidation> {
    try {
      // Extract owner and repo from URL
      const match = repositoryUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)/,
      );
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

      // Fetch repository data
      const { data } = await this.octokit.repos.get({
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

      this.logger.error(
        `Failed to validate repository ${repositoryUrl}`,
        error,
      );
      throw new HttpException(
        'Failed to validate repository',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sync GitHub data for a developer profile
   */
  async syncDeveloperGitHubData(developerId: string): Promise<any> {
    try {
      // Get developer with GitHub URL
      const developer = await this.prisma.developer.findUnique({
        where: { id: developerId },
        include: { projects: true },
      });

      if (!developer) {
        throw new HttpException('Developer not found', HttpStatus.NOT_FOUND);
      }

      if (!developer.github) {
        throw new HttpException(
          'Developer has no GitHub profile linked',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Extract username from GitHub URL
      const username = this.extractGitHubUsername(developer.github);
      if (!username) {
        throw new HttpException(
          'Invalid GitHub URL format',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Fetch GitHub stats
      const stats = await this.getGitHubStats(username);

      // Update projects with GitHub data
      for (const project of developer.projects) {
        if (project.repositoryUrl) {
          const validation = await this.validateRepository(
            project.repositoryUrl,
          );
          if (validation.isValid) {
            await this.prisma.project.update({
              where: { id: project.id },
              data: {
                githubStars: validation.stars,
                githubForks: validation.forks,
              },
            });
          }
        }
      }

      // Store open source contributions
      await this.prisma.openSourceContribution.upsert({
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

      this.logger.log(`Synced GitHub data for developer ${developerId}`);

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
    } catch (error: any) {
      this.logger.error(
        `Failed to sync GitHub data for developer ${developerId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Calculate contribution score based on GitHub metrics
   * Returns a score between 0-100
   */
  private calculateContributionScore(metrics: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    followers: number;
  }): number {
    const { totalRepos, totalStars, totalForks, followers } = metrics;

    // Weighted scoring (max 100 points)
    const repoScore = Math.min((totalRepos / 20) * 25, 25); // Max 25 points
    const starScore = Math.min((totalStars / 100) * 30, 30); // Max 30 points
    const forkScore = Math.min((totalForks / 50) * 20, 20); // Max 20 points
    const followerScore = Math.min((followers / 50) * 25, 25); // Max 25 points

    const totalScore = repoScore + starScore + forkScore + followerScore;

    return Math.round(totalScore * 10) / 10; // Round to 1 decimal
  }

  /**
   * Extract GitHub username from profile URL
   */
  private extractGitHubUsername(githubUrl: string): string | null {
    const match = githubUrl.match(/github\.com\/([^\/]+)/);
    return match ? match[1] : null;
  }
}
