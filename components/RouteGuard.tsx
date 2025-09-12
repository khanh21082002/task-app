import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/"];
// Default route for authenticated users
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";
// Default route for non-authenticated users
const DEFAULT_PUBLIC_ROUTE = "/";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  // Get authentication state and loading status
  const { isLoggedIn, isLoading } = useAuth();
  // Get current path name
  const pathname = usePathname();
  // Get router instance for navigation
  const router = useRouter();
  // Track if the component is ready to render children
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If authentication is still loading, wait until it's complete
    if (isLoading) return;

    // Check if current path is a public route
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If user is logged in but on public route, redirect to dashboard
    if (isLoggedIn && pathname === DEFAULT_PUBLIC_ROUTE) {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    }
    // If user is not logged in and not on public route, redirect to public route
    else if (!isLoggedIn && !isPublicRoute) {
      router.replace(DEFAULT_PUBLIC_ROUTE);
    }
    // Otherwise, component is ready to render children
    else {
      setIsReady(true);
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  // Show loading skeleton while not ready
  if (!isReady) return <LoadingSkeleton />;

  // Render children when ready
  return <>{children}</>;
}