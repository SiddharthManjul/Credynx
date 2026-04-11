import { reputationService } from '@/lib/server/services/reputation';
import { requireRole } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST() {
  try {
    await requireRole('ADMIN');
    const result = await reputationService.recalculateAllReputations();
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
