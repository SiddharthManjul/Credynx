import { githubService } from '@/lib/server/services/github';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const stats = await githubService.getGitHubStats(username);
    return Response.json(stats);
  } catch (err) {
    return jsonError(err);
  }
}
