import { developersService } from '@/lib/server/services/developers';
import { projectsService } from '@/lib/server/services/projects';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const developer = await developersService.developer({ id });
    if (!developer) throw new HttpError(404, 'Developer not found');
    const projects = await projectsService.findProjectsByDeveloper(id);
    return Response.json(projects);
  } catch (err) {
    return jsonError(err);
  }
}
