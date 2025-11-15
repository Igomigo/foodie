"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, ComponentType } from "react";
import { isAuthenticated } from "@/config/axios";

/**
 * =============================================================================
 * ROUTE PROTECTION MIDDLEWARE (HOC)
 * =============================================================================
 *
 * This is a Higher-Order Component (HOC) that wraps your protected pages
 * to ensure only authenticated users can access them.
 *
 * WHAT IT DOES:
 * 1. Checks if the user is authenticated (has a valid access token)
 * 2. If NOT authenticated:
 *    - Saves the current URL to localStorage
 *    - Redirects to login page
 *    - After login, user is redirected back to the intended page
 * 3. If authenticated:
 *    - Renders the protected page normally
 *
 * WHY WE USE IT:
 * - Centralized authentication logic (DRY principle)
 * - Prevents unauthorized access to protected routes
 * - Works seamlessly with the axios redirect logic
 * - Simple to use: just wrap any protected component
 *
 * USAGE EXAMPLE:
 * ```tsx
 * import withAuth from "@/middleware/withAuth";
 *
 * function DashboardPage() {
 *   return <div>Protected Dashboard Content</div>;
 * }
 *
 * export default withAuth(DashboardPage);
 * ```
 *
 * ALTERNATIVE USAGE WITH OPTIONS:
 * ```tsx
 * export default withAuth(DashboardPage, {
 *   requiredRole: "admin", // Optional: restrict to specific roles
 *   redirectTo: "/auth/login", // Optional: custom redirect path
 * });
 * ```
 */

interface WithAuthOptions {
  /**
   * Optional: Require a specific role to access the page
   * If specified, user must have this role in addition to being authenticated
   */
  requiredRole?: string;

  /**
   * Optional: Custom redirect path when not authenticated
   * Defaults to "/auth/login"
   */
  redirectTo?: string;
}

/**
 * Higher-Order Component for route protection
 *
 * @param Component - The component to protect
 * @param options - Optional configuration for the HOC
 * @returns Protected component that checks authentication before rendering
 */
export default function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { requiredRole, redirectTo = "/auth/login" } = options;

  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      /**
       * AUTHENTICATION CHECK
       *
       * This runs when the component mounts (page loads)
       * We check authentication on the client-side because:
       * 1. Access tokens are stored in localStorage (client-side only)
       * 2. Next.js App Router requires client-side auth checks for this pattern
       */
      const checkAuth = () => {
        // Check if user has a valid access token
        const authenticated = isAuthenticated();

        if (!authenticated) {
          /**
           * NOT AUTHENTICATED:
           * Save current URL and redirect to login
           * The axios interceptor will also do this on API failures,
           * but we check here to prevent the page from rendering at all
           */
          const currentPath = window.location.pathname + window.location.search;
          localStorage.setItem("redirectAfterLogin", currentPath);
          router.replace(redirectTo);
          return;
        }

        /**
         * ROLE-BASED ACCESS CONTROL (Optional)
         *
         * If a specific role is required, verify the user has it
         * This is useful for pages that should only be accessible to:
         * - Admins only
         * - Vendors only
         * - Premium users only
         * etc.
         */
        if (requiredRole) {
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userRole = user?.role;

          if (userRole !== requiredRole) {
            // User doesn't have required role, redirect to unauthorized page
            // You can customize this behavior
            router.replace("/unauthorized");
            return;
          }
        }

        // All checks passed, allow rendering
        setIsChecking(false);
      };

      checkAuth();
    }, [router, requiredRole, redirectTo]);

    /**
     * LOADING STATE
     *
     * While checking authentication, show a loading state
     * This prevents a flash of the protected content before redirect
     * You can customize this to use your app's loading component
     */
    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying access...</p>
          </div>
        </div>
      );
    }

    /**
     * RENDER PROTECTED COMPONENT
     *
     * If we reach here, the user is authenticated (and has the required role if specified)
     * Render the actual protected component with all its props
     */
    return <Component {...props} />;
  };
}

/**
 * =============================================================================
 * ADDITIONAL UTILITY: Role-Specific HOCs
 * =============================================================================
 *
 * These are convenience wrappers for common role requirements
 * You can add more as needed for your application
 */

/**
 * HOC specifically for admin-only pages
 *
 * @example
 * ```tsx
 * import { withAdminAuth } from "@/middleware/withAuth";
 *
 * function AdminDashboard() {
 *   return <div>Admin Only Content</div>;
 * }
 *
 * export default withAdminAuth(AdminDashboard);
 * ```
 */
export function withAdminAuth<P extends object>(Component: ComponentType<P>) {
  return withAuth(Component, { requiredRole: "admin" });
}

/**
 * HOC specifically for vendor-only pages
 */
export function withVendorAuth<P extends object>(Component: ComponentType<P>) {
  return withAuth(Component, { requiredRole: "vendor" });
}

/**
 * HOC specifically for user-only pages
 */
export function withUserAuth<P extends object>(Component: ComponentType<P>) {
  return withAuth(Component, { requiredRole: "user" });
}
