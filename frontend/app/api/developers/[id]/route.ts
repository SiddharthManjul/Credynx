import { developersService } from '@/lib/server/services/developers';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const developer = await developersService.getDeveloperWithProjects(id);
    if (!developer) throw new HttpError(404, 'Developer not found');
    return Response.json(developer);
  } catch (err) {
    return jsonError(err);
  }
}
