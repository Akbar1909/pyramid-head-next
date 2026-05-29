function formatMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message: unknown }).message;
    if (typeof m === "string") {
      return m;
    }
    if (Array.isArray(m)) {
      return m.map(String).join(", ");
    }
  }
  return "Request failed";
}

export class ApiError extends Error {
  readonly status: number;

  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(formatMessage(body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
