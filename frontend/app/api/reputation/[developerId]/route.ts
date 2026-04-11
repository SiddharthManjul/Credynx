import { reputationService } from '@/lib/server/services/reputation';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ developerId: string }> },
) {
  try {
    const { developerId } = await params;
    try {
      const score = await reputationService.getReputation(developerId);
      return Response.json(score);
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        const calculated = await reputationService.calculateReputation(developerId);
        return Response.json(calculated);
      }
      throw err;
    }
  } catch (err) {
    return jsonError(err);
  }
}
