import { opportunitiesService } from '@/lib/server/services/opportunities';
import { jsonError, searchParamsOf } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const params = searchParamsOf(req);
    const result = await opportunitiesService.getOpenGrants({
      ecosystem: params.ecosystem,
      skip: params.skip ? parseInt(params.skip, 10) : undefined,
      take: params.take ? parseInt(params.take, 10) : undefined,
    });
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
