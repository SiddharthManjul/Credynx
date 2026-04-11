import { profileService } from '@/lib/server/services/profile';
import { projectsService } from '@/lib/server/services/projects';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';
import { CreateProjectSchema } from '@/lib/server/validation/project';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireUser();
    const profile: any = await profileService.getFullProfile(user.id);
    if (!profile.developer) {
      throw new HttpError(403, 'Only developers can have projects');
    }
    const projects = await projectsService.findProjectsByDeveloper(profile.developer.id);
    return Response.json(projects);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const profile: any = await profileService.getFullProfile(user.id);
    if (!profile.developer) {
      throw new HttpError(403, 'Only developers can create projects');
    }

    const dto = CreateProjectSchema.parse(await req.json());
    const project = await projectsService.createProject({
      developer: { connect: { id: profile.developer.id } },
      ...dto,
    });
    return Response.json(project, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
