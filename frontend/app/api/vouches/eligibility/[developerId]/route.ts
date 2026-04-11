import { vouchingService } from '@/lib/server/services/vouching';
import { requireUser } from '@/lib/server/session';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ developerId: string }> },
) {
  try {
    await requireUser();
    const { developerId } = await params;
    const result = await vouchingService.checkVouchEligibility(developerId);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
