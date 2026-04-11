import { profileService } from '@/lib/server/services/profile';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';
import {
  CreateDeveloperProfileSchema,
  UpdateDeveloperProfileSchema,
  CreateFounderProfileSchema,
  UpdateFounderProfileSchema,
} from '@/lib/server/validation/profile';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await profileService.getFullProfile(user.id);
    return Response.json(profile);
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    if (user.role === 'DEVELOPER') {
      const dto = UpdateDeveloperProfileSchema.parse(body);
      const result = await profileService.updateDeveloperProfile(user.id, dto);
      return Response.json(result);
    }
    if (user.role === 'FOUNDER') {
      const dto = UpdateFounderProfileSchema.parse(body);
      const result = await profileService.updateFounderProfile(user.id, dto);
      return Response.json(result);
    }

    // Admin or other: detect profile type by what exists
    const profile = await profileService.getFullProfile(user.id);
    if ((profile as any).developer) {
      const dto = UpdateDeveloperProfileSchema.parse(body);
      const result = await profileService.updateDeveloperProfile(user.id, dto);
      return Response.json(result);
    }
    if ((profile as any).founder) {
      const dto = UpdateFounderProfileSchema.parse(body);
      const result = await profileService.updateFounderProfile(user.id, dto);
      return Response.json(result);
    }

    throw new HttpError(404, 'No profile found to update');
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    if (user.role === 'DEVELOPER') {
      const dto = CreateDeveloperProfileSchema.parse(body);
      const result = await profileService.createDeveloperProfile(user.id, dto);
      return Response.json(result, { status: 201 });
    }
    if (user.role === 'FOUNDER') {
      const dto = CreateFounderProfileSchema.parse(body);
      const result = await profileService.createFounderProfile(user.id, dto);
      return Response.json(result, { status: 201 });
    }

    throw new HttpError(400, 'Invalid user role');
  } catch (err) {
    return jsonError(err);
  }
}
