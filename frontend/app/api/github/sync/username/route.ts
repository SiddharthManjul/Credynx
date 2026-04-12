import { githubService } from '@/lib/server/services/github';
import { developersService } from '@/lib/server/services/developers';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';
import { SyncGithubProfileSchema } from '@/lib/server/validation/github';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const developer = await developersService.findDeveloperByUserId(user.id);
    if (!developer) {
      throw new HttpError(403, 'Only developers can sync GitHub data');
    }

    const { githubUsername } = SyncGithubProfileSchema.parse(await req.json());
    const stats = await githubService.getGitHubStats(githubUsername);

    return Response.json({
      message: 'GitHub profile fetched successfully',
      stats: {
        profile: stats.profile,
        totalRepos: stats.repositories.length,
        totalStars: stats.totalStars,
        totalForks: stats.totalForks,
        contributionScore: stats.contributionScore,
        languages: stats.languages,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
