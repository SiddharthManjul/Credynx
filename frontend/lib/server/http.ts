import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Translate any thrown error into a JSON Response.
 * Use in a try/catch inside route handlers.
 */
export function jsonError(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ message: err.message }, { status: err.status });
  }

  if (err instanceof ZodError) {
    return Response.json(
      { message: 'Validation failed', errors: err.issues },
      { status: 400 },
    );
  }

  // Prisma known errors have a `code` like 'P2002'
  if (err && typeof err === 'object' && 'code' in err && typeof (err as any).code === 'string') {
    const code = (err as any).code as string;
    if (code === 'P2002') {
      return Response.json(
        { message: 'Unique constraint violation' },
        { status: 409 },
      );
    }
    if (code === 'P2025') {
      return Response.json(
        { message: 'Record not found' },
        { status: 404 },
      );
    }
  }

  // eslint-disable-next-line no-console
  console.error('[api] unhandled error:', err);
  return Response.json({ message: 'Internal server error' }, { status: 500 });
}

/**
 * Read query params off a Next.js request URL as a plain object.
 */
export function searchParamsOf(req: Request): Record<string, string> {
  const url = new URL(req.url);
  return Object.fromEntries(url.searchParams);
}
