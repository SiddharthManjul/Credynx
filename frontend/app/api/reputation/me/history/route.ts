import { reputationService } from '@/lib/server/services/reputation';
import { developersService } from '@/lib/server/services/developers';
import { requireUser } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireUser();
    const developer = await developersService.findDeveloperByUserId(user.id);
    if (!developer) return Response.json([]);
    const history = await reputationService.getReputationHistory(developer.id);
    return Response.json(history);
  } catch (err) {
    return jsonError(err);
  }
}
