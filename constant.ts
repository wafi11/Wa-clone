import { createRouteMatcher } from "@clerk/nextjs/server";

export const isProtectedRoute = createRouteMatcher(["/(.*)"]);
