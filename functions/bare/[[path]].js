export async function onRequest(context) {
  const request = context.request;
  const targetUrl = request.headers.get("x-bare-url");
  if (!targetUrl) return new Response("Bare endpoint active", { status: 200 });

  const rawHeaders = JSON.parse(request.headers.get("x-bare-headers") || "{}");
  const proxyHeaders = new Headers();
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (Array.isArray(value)) value.forEach(v => proxyHeaders.append(key, v));
    else proxyHeaders.set(key, value);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: proxyHeaders,
    body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
    redirect: "manual"
  });

  const responseHeaders = new Headers();
  const outBareHeaders = {};
  response.headers.forEach((value, key) => { outBareHeaders[key] = value; });

  responseHeaders.set("x-bare-status", response.status.toString());
  responseHeaders.set("x-bare-status-text", response.statusText);
  responseHeaders.set("x-bare-headers", JSON.stringify(outBareHeaders));
  responseHeaders.set("Access-Control-Expose-Headers", "x-bare-status, x-bare-status-text, x-bare-headers");

  return new Response(response.body, { status: 200, headers: responseHeaders });
}
