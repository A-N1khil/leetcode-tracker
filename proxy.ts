import { auth } from "@/lib/auth/server";
import { type NextRequest, NextResponse } from "next/server";

const neonMiddleware = auth.middleware({
  loginUrl: "/signup",
});

export default function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }
  return neonMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)"],
};
