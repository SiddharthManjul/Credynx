import { reputationService } from '@/lib/server/services/reputation';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ developerId: string }> },
) {
  try {
    const { developerId } = await params;
    const history = await reputationService.getReputationHistory(developerId);
    return Response.json(history);
  } catch (err) {
    return jsonError(err);
  }
}
