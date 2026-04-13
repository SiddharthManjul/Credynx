import { foundersService } from '@/lib/server/services/founders';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const founder = await foundersService.getFounderWithJobs(id);
    if (!founder) throw new HttpError(404, 'Founder not found');
    return Response.json(founder);
  } catch (err) {
    return jsonError(err);
  }
}
