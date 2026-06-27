import { auth0 } from "./lib/auth0";

export async function proxy(request: Request) {
  console.log("PROXY URL:", request.url);
  console.log("AUTH0_DOMAIN:", process.env.AUTH0_DOMAIN);
  console.log("APP_BASE_URL:", process.env.APP_BASE_URL);
  console.log("AUTH0_CLIENT_ID:", process.env.AUTH0_CLIENT_ID);

  const authResponse = await auth0.middleware(request);
  console.log("authResponse exists?", !!authResponse);
  if (authResponse) {
    console.log("authResponse status:", authResponse.status);
    console.log("authResponse headers x-middleware-next:", authResponse.headers.get("x-middleware-next"));
    console.log("authResponse headers location:", authResponse.headers.get("location"));
  }

  // Always return the auth response.
  //
  // Note: The auth response forwards requests to your app routes by default.
  // If you need to block requests, do it before calling auth0.middleware() or
  // copy the authResponse headers except for x-middleware-next to your blocking response.
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};