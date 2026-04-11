import { projectsService } from '@/lib/server/services/projects';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const projects = await projectsService.projects({
      where: { id },
      include: {
        developer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            tier: true,
            reputationScore: true,
            github: true,
            twitter: true,
            linkedin: true,
          },
        },
      },
      take: 1,
    });

    if (!projects || projects.length === 0) {
      throw new HttpError(404, 'Project not found');
    }

    return Response.json(projects[0]);
  } catch (err) {
    return jsonError(err);
  }
}
