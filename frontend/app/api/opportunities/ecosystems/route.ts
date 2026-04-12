import { opportunitiesService } from '@/lib/server/services/opportunities';
import { jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const ecosystems = await opportunitiesService.getEcosystems();
    return Response.json(ecosystems);
  } catch (err) {
    return jsonError(err);
  }
}
