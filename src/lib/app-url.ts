export function getAppBaseUrl() {
  const rawBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim();
  return rawBaseUrl.replace(/\/+$/, "");
}

export function getAppUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getAppBaseUrl()}${normalizedPath}`;
}
