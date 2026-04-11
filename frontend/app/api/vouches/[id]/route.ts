import { vouchingService } from '@/lib/server/services/vouching';
import { requireUser } from '@/lib/server/session';
import { HttpError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

/** GET /api/vouches/:developerId — list vouches received by a developer (public-ish). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await vouchingService.getVouchesForDeveloper(id);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}

/** DELETE /api/vouches/:vouchId — revoke a vouch the current user owns. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    if (!user.developer) {
      throw new HttpError(403, 'Only developers can revoke vouches');
    }
    const { id } = await params;
    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body?.reason;
    } catch {
      // Empty body is allowed
    }
    const result = await vouchingService.revokeVouch(id, user.developer.id, reason);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
