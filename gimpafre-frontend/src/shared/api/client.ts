// Cliente HTTP centralizado.
// - Inyecta la baseURL del backend.
// - Adjunta el token JWT como "Authorization: Bearer <token>" en cada request.
// - Ante un 401 (token ausente/expirado): limpia la sesión y redirige a /login.

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = "gimpafre_token";

// --- Gestión del token en localStorage (único punto que lo toca) ---
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Error tipado para que las capas superiores puedan distinguir el código HTTP.
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  // Si es true, NO adjunta el token (para el login, que aún no lo tiene).
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, skipAuth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Manejo global del 401: sesión inválida o expirada.
  if (response.status === 401) {
    clearToken();
    // Evita bucle si el propio login devuelve 401 (credenciales malas).
    if (!skipAuth) {
      window.location.href = "/login";
    }
    const errorBody = await safeJson(response);
    throw new ApiError(401, "No autorizado", errorBody);
  }

  if (!response.ok) {
    const errorBody = await safeJson(response);
    throw new ApiError(
      response.status,
      `Error ${response.status}`,
      errorBody
    );
  }

    // 204 No Content (p. ej. algunos DELETE) no trae body.
  if (response.status === 204) {
    return undefined as T;
  }

  // Algunos DELETE de este backend devuelven 200 sin body (ResponseEntity<Void>
  // de Spring). safeJson tolera cuerpo vacío en vez de reventar con response.json().
  return (await safeJson(response)) as T;
}

// Parsea JSON sin reventar si el cuerpo viene vacío o no es JSON.
async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}