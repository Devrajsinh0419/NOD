import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  onCallback: async (error, context, session) => {
    if (error) {
      console.error("=== AUTH0 CALLBACK ERROR ===");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("Stack:", error.stack);
      if (error.cause) {
        console.error("Cause:", error.cause);
        const causeAny = error.cause as any;
        if (causeAny.message) console.error("Cause Message:", causeAny.message);
        if (causeAny.code) console.error("Cause Code:", causeAny.code);
      }
      console.error("===========================");
      return new NextResponse(error.message, { status: 500 });
    }
    const appBaseUrl = context.appBaseUrl;
    if (!appBaseUrl) {
      throw new Error("appBaseUrl could not be resolved for the callback redirect.");
    }
    const returnTo = context.returnTo || "/";
    const redirectUrl = returnTo.startsWith("http") ? returnTo : `${appBaseUrl}${returnTo}`;
    return NextResponse.redirect(redirectUrl);
  }
});
