import { reputationService } from '@/lib/server/services/reputation';
import { requireUser } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ developerId: string }> },
) {
  try {
    await requireUser();
    const { developerId } = await params;
    const result = await reputationService.calculateReputation(developerId);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
