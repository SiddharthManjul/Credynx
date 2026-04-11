import { profileService } from '@/lib/server/services/profile';
import { projectsService } from '@/lib/server/services/projects';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';
import { UpdateProjectSchema } from '@/lib/server/validation/project';

export const runtime = 'nodejs';

async function assertOwnership(userId: string, projectId: string) {
  const profile: any = await profileService.getFullProfile(userId);
  if (!profile.developer) {
    throw new HttpError(403, 'Only developers can modify projects');
  }
  const project = await projectsService.findProjectById(projectId);
  if (!project || project.developerId !== profile.developer.id) {
    throw new HttpError(404, 'Project not found or access denied');
  }
  return profile.developer.id;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await assertOwnership(user.id, id);
    const dto = UpdateProjectSchema.parse(await req.json());
    const updated = await projectsService.updateProject({
      where: { id },
      data: dto,
    });
    return Response.json(updated);
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await assertOwnership(user.id, id);
    await projectsService.deleteProject({ id });
    return Response.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
