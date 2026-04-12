import { githubService } from '@/lib/server/services/github';
import { requireUser } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ developerId: string }> },
) {
  try {
    await requireUser();
    const { developerId } = await params;
    const result = await githubService.syncDeveloperGitHubData(developerId);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
