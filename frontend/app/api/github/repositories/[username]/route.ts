import { githubService } from '@/lib/server/services/github';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const repos = await githubService.getGitHubRepositories(username);
    return Response.json(repos);
  } catch (err) {
    return jsonError(err);
  }
}
