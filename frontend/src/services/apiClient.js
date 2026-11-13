import { STORAGE } from "../config/api";

export async function apiRequest(url, { method = "GET", body, params } = {}) {
  const token = localStorage.getItem(STORAGE.token);
  const query = params ? `?${new URLSearchParams(params)}` : "";

  const isFormData = body instanceof FormData;

  const res = await fetch(`${url}${query}`, {
    method,
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });   

  const data = await res.json().catch(() => ({}));

  // Expired / invalid token -> balik sa login
  if (res.status === 401 && token) {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.user);
    window.location.href = "/login";
  }

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    throw error;
  }
  return data;
}
