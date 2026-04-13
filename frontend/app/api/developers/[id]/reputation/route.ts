import { developersService } from '@/lib/server/services/developers';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const developer = await developersService.developer({ id });
    if (!developer) throw new HttpError(404, 'Developer not found');
    return Response.json({
      developerId: developer.id,
      username: developer.username,
      tier: developer.tier,
      reputationScore: developer.reputationScore,
    });
  } catch (err) {
    return jsonError(err);
  }
}
