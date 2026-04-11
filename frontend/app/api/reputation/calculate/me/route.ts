import { reputationService } from '@/lib/server/services/reputation';
import { developersService } from '@/lib/server/services/developers';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await requireUser();
    const developer = await developersService.findDeveloperByUserId(user.id);
    if (!developer) {
      throw new HttpError(403, 'Only developers can calculate reputation');
    }
    const result = await reputationService.calculateReputation(developer.id);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
