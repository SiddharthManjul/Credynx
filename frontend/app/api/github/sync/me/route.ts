import { githubService } from '@/lib/server/services/github';
import { developersService } from '@/lib/server/services/developers';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await requireUser();
    const developer = await developersService.findDeveloperByUserId(user.id);
    if (!developer) {
      throw new HttpError(403, 'Only developers can sync GitHub data');
    }
    const result = await githubService.syncDeveloperGitHubData(developer.id);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
