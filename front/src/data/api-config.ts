function cleanUrl(value?: string) {
  const url = value?.trim();
  if (!url) return "";
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return cleanUrl(process.env.NEXT_PUBLIC_API_URL) || "/api";
}

export function getSocketBaseUrl() {
  const configuredSocketUrl = cleanUrl(process.env.NEXT_PUBLIC_SOCKET_URL);
  if (configuredSocketUrl) return configuredSocketUrl;

  const configuredApiUrl = cleanUrl(process.env.NEXT_PUBLIC_API_URL);
  if (configuredApiUrl) return configuredApiUrl;

  return "http://localhost:3001";
}
