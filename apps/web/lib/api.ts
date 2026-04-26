const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function extractErrorMessage(errorData: unknown): string {
  if (!errorData || typeof errorData !== "object") return "Request failed";

  const maybeError = (errorData as { error?: unknown }).error;
  if (typeof maybeError === "string") return maybeError;
  if (maybeError && typeof maybeError === "object") {
    const message = (maybeError as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  const message = (errorData as { message?: unknown }).message;
  if (typeof message === "string") return message;
  return "Request failed";
}

export async function api<T>(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(errorData));
  }
  return (await response.json()) as T;
}
