import { vouchingService } from '@/lib/server/services/vouching';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.developer) {
      throw new HttpError(403, 'Only developers can view their vouches given');
    }
    const vouches = await vouchingService.getVouchesGivenByDeveloper(user.developer.id);
    return Response.json(vouches);
  } catch (err) {
    return jsonError(err);
  }
}
