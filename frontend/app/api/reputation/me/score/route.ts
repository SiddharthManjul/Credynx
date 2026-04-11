import { reputationService } from '@/lib/server/services/reputation';
import { developersService } from '@/lib/server/services/developers';
import { requireUser } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireUser();
    const developer = await developersService.findDeveloperByUserId(user.id);
    if (!developer) return Response.json(null);

    try {
      const score = await reputationService.getReputation(developer.id);
      return Response.json(score);
    } catch {
      return Response.json(null);
    }
  } catch (err) {
    return jsonError(err);
  }
}
