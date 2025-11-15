# Authentication Implementation - Usage Examples

Quick reference guide for using the authentication system in your Foodie app.

---

## 🔒 Protecting Routes

### Method 1: Protect an Entire Route Group (Recommended)

**Best for:** When you have multiple pages that should all be protected

```tsx
// app/(Protected)/layout.tsx
import withAuth from "@/middleware/withAuth";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default withAuth(ProtectedLayout);
```

✅ **Now all pages inside `(Protected)` folder are automatically protected:**
- `/home` → Protected
- `/orders` → Protected
- `/profile` → Protected
- etc.

**This is what you have now!** ✨

---

### Method 2: Protect Individual Pages

**Best for:** One-off protected pages outside the protected route group

```tsx
// app/special-offer/page.tsx
"use client";
import withAuth from "@/middleware/withAuth";

function SpecialOfferPage() {
  return <div>Special Offer Content</div>;
}

export default withAuth(SpecialOfferPage);
```

---

### Method 3: Role-Based Protection

**Admin-Only Page:**

```tsx
// app/admin/dashboard/page.tsx
"use client";
import { withAdminAuth } from "@/middleware/withAuth";

function AdminDashboard() {
  return <div>Admin Dashboard</div>;
}

export default withAdminAuth(AdminDashboard);
```

**Vendor-Only Page:**

```tsx
// app/vendor/dashboard/page.tsx
"use client";
import { withVendorAuth } from "@/middleware/withAuth";

function VendorDashboard() {
  return <div>Vendor Dashboard</div>;
}

export default withVendorAuth(VendorDashboard);
```

**Custom Role:**

```tsx
// app/premium/page.tsx
"use client";
import withAuth from "@/middleware/withAuth";

function PremiumPage() {
  return <div>Premium Content</div>;
}

export default withAuth(PremiumPage, { requiredRole: "premium" });
```

---

## 🌐 Making API Calls

### Basic Authenticated Request

```tsx
// services/user.service.ts
import { axiosInstance } from "@/config/axios";

export const getUserProfile = async () => {
  const response = await axiosInstance.get("/user/profile");
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await axiosInstance.put("/user/profile", data);
  return response.data;
};
```

**In your component:**

```tsx
"use client";
import { getUserProfile } from "@/services/user.service";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return <div>{/* Render profile */}</div>;
}
```

**What happens automatically:**
1. ✅ Access token is attached to the request
2. ✅ If token expired (401), it refreshes automatically
3. ✅ Request is retried with new token
4. ✅ If refresh fails, user is redirected to login

---

## 👤 Accessing User Information

### In Components

```tsx
"use client";
import { getUser, getUserRole, getUserId } from "@/config/axios";

export default function WelcomeSection() {
  const user = getUser();
  const role = getUserRole();
  const userId = getUserId();

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      <p>Role: {role}</p>
      <p>ID: {userId}</p>
    </div>
  );
}
```

### In Services

```tsx
import { getAccessToken, getUserId } from "@/config/axios";
import { axiosInstance } from "@/config/axios";

export const getMyOrders = async () => {
  const userId = getUserId();
  const response = await axiosInstance.get(`/orders/user/${userId}`);
  return response.data;
};
```

---

## 🔐 Authentication Actions

### Login

**Your existing implementation is perfect!** Just ensure you're using the service:

```tsx
// In your login component
import { signIn } from "@/services/auth.service";

const handleLogin = async (data: LoginFormData) => {
  try {
    const response = await signIn(data);
    
    // Check for redirect
    const redirectRoute = localStorage.getItem('redirectAfterLogin');
    if (redirectRoute) {
      localStorage.removeItem('redirectAfterLogin');
      router.replace(redirectRoute);
    } else {
      router.replace("/home");
    }
  } catch (error) {
    // Handle error
  }
};
```

---

### Logout

```tsx
// services/auth.service.ts
import { axiosInstance, logoutUser } from "@/config/axios";

export const logout = async () => {
  try {
    // Call server to clear refresh token cookie
    await axiosInstance.post("/auth/logout");
    
    // Clear local storage
    logoutUser();
    
    // Redirect to login
    window.location.href = "/auth/login";
  } catch (error) {
    // Even if server call fails, clear local storage
    logoutUser();
    window.location.href = "/auth/login";
  }
};
```

**In your component:**

```tsx
import { logout } from "@/services/auth.service";

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

---

## 🎨 Conditional Rendering Based on Auth

### Show/Hide Content Based on Authentication

```tsx
"use client";
import { isAuthenticated } from "@/config/axios";
import { useState, useEffect } from "react";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <nav>
      {isLoggedIn ? (
        <>
          <Link href="/home">Dashboard</Link>
          <Link href="/profile">Profile</Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
```

### Show/Hide Based on Role

```tsx
"use client";
import { getUserRole } from "@/config/axios";

export default function AdminPanel() {
  const role = getUserRole();

  if (role !== "admin") {
    return null; // Don't render for non-admins
  }

  return (
    <div>
      <h2>Admin Controls</h2>
      {/* Admin-only content */}
    </div>
  );
}
```

---

## 🔄 Handling Token Expiry

**You don't need to do anything!** The axios interceptor handles everything automatically.

But if you want to manually trigger a check:

```tsx
import { axiosInstance } from "@/config/axios";

// This will automatically refresh if needed
const checkAuth = async () => {
  try {
    await axiosInstance.get("/auth/verify");
    // Token is valid
  } catch (error) {
    // Token expired and refresh failed - user will be redirected to login
  }
};
```

---

## 🧪 Testing Scenarios

### Test 1: Protected Route Access (Not Logged In)

1. Open incognito window
2. Go to `http://localhost:3000/home`
3. Should redirect to `/auth/login`
4. After login, should redirect back to `/home`

### Test 2: Token Expiry (For Testing Only)

To test token expiry, modify your token expiry to 10 seconds on the server:

```typescript
// server/src/utils/jwt.ts
public async generateAccessToken(payload: any): Promise<string> {
  return jwt.sign(payload, this.secretKey, { expiresIn: "10s" }); // Changed from "5m"
}
```

Then:
1. Login
2. Wait 10 seconds
3. Make an API call (e.g., click a button that fetches data)
4. Should automatically refresh and work seamlessly

### Test 3: Multiple Tabs

1. Open 3 tabs with your app
2. Let token expire
3. Make API calls in all tabs simultaneously
4. Only ONE refresh call should be made
5. All tabs should work correctly

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module '@/middleware/withAuth'"

**Solution:** Make sure your `tsconfig.json` has the path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 2: "window is not defined"

**Solution:** Make sure the component using auth functions has `"use client"` at the top.

### Issue 3: Redirect loop

**Cause:** The protected page is trying to make an API call during SSR.

**Solution:** Move API calls to `useEffect` or use client-side only.

```tsx
"use client";
import { useEffect } from "react";

export default function MyPage() {
  useEffect(() => {
    // API calls here
  }, []);

  return <div>Content</div>;
}
```

### Issue 4: User sees protected content briefly before redirect

**Solution:** This is already handled by the loading state in `withAuth`. If you still see it, make sure you're using the HOC correctly.

---

## 📱 Real-World Example: User Dashboard

Complete example of a protected dashboard with API calls:

```tsx
"use client";
import withAuth from "@/middleware/withAuth";
import { useEffect, useState } from "react";
import { axiosInstance, getUser } from "@/config/axios";
import { logout } from "@/services/auth.service";

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <header>
        <h1>Welcome back, {user?.username}!</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <main>
        <div>
          <h2>Your Stats</h2>
          <p>Orders: {stats?.orderCount}</p>
          <p>Favorites: {stats?.favoriteCount}</p>
        </div>
      </main>
    </div>
  );
}

// Protect this entire page
export default withAuth(DashboardPage);
```

---

## ✅ Summary

**What you have now:**

1. ✅ All pages in `(Protected)` folder are automatically protected
2. ✅ Automatic token refresh on expiry
3. ✅ Request queuing for multiple simultaneous 401s
4. ✅ Redirect to login when refresh fails
5. ✅ Post-login redirect to intended page
6. ✅ Role-based access control ready
7. ✅ Clean, maintainable code

**You're all set!** Just use `withAuth()` for any new protected pages and the rest is automatic. 🎉

