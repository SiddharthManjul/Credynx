import { opportunitiesService } from '@/lib/server/services/opportunities';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const hackathon = await opportunitiesService.getHackathon(id);
    if (!hackathon) throw new HttpError(404, 'Hackathon not found');
    return Response.json(hackathon);
  } catch (err) {
    return jsonError(err);
  }
}
