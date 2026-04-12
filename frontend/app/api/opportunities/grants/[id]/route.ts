import { opportunitiesService } from '@/lib/server/services/opportunities';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const grant = await opportunitiesService.getGrant(id);
    if (!grant) throw new HttpError(404, 'Grant not found');
    return Response.json(grant);
  } catch (err) {
    return jsonError(err);
  }
}
