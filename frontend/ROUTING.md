# Routing Structure Documentation

## Overview

This application uses role-based routing to direct users to appropriate pages after authentication.

## Authentication Flow

```
User visits app
    ↓
Landing at "/"
    ↓
Check authentication status
    ↓
    ├─ Not authenticated → Redirect to /auth
    │       ↓
    │   Login/Signup Page
    │       ↓
    │   User enters phone + password
    │       ↓
    │   User role selected (Customer or Mechanic)
    │       ↓
    │   Submit credentials
    │       ↓
    └─ Authenticated → Check user role
            ↓
            ├─ Role: Customer → /customer/home
            │       ↓
            │   "This is Customer Home" (placeholder)
            │
            └─ Role: Mechanic → /mechanic/dashboard
                    ↓
                "This is Mechanic Dashboard" (placeholder)
```

## Route Structure

### Public Routes

- **`/auth`** - Authentication page (login/signup)
  - No authentication required
  - Users select role (Customer or Mechanic) during signup
  - Phone number + password authentication only

### Protected Routes (Customer)

- **`/customer/home`** - Customer home page
  - Requires authentication
  - Only accessible by users with role: "customer"
  - Current: Text placeholder "This is Customer Home"
  - Future: Full customer home UI with mechanic discovery features

### Protected Routes (Mechanic)

- **`/mechanic/dashboard`** - Mechanic dashboard
  - Requires authentication
  - Only accessible by users with role: "mechanic"
  - Current: Text placeholder "This is Mechanic Dashboard"
  - Future: Full mechanic dashboard UI with service management

### Special Routes

- **`/`** - Root/landing route

  - Intelligent redirect based on authentication and role
  - Not authenticated → `/auth`
  - Authenticated as Customer → `/customer/home`
  - Authenticated as Mechanic → `/mechanic/dashboard`

- **`/*`** - Catch-all route
  - Redirects any undefined route to `/`
  - Prevents 404 errors

## Route Protection

### ProtectedRoute Component

```jsx
Purpose: Ensure user is authenticated before accessing route
Location: /src/components/shared/ProtectedRoute.jsx

Logic:
- If authenticated → Allow access
- If not authenticated → Redirect to /auth
```

### RoleBasedRoute Component

```jsx
Purpose: Ensure user has correct role for the route
Location: /src/components/shared/RoleBasedRoute.jsx

Logic:
- If not authenticated → Redirect to /auth
- If authenticated but wrong role → Redirect to user's appropriate home
  - Customer trying to access mechanic route → /customer/home
  - Mechanic trying to access customer route → /mechanic/dashboard
- If authenticated with correct role → Allow access
```

## Future Route Expansion

### Customer Routes (Future)

```
/customer/
├── /home                    - Customer home (current placeholder)
├── /mechanics               - Browse/search mechanics
├── /mechanic/:id            - View mechanic profile
├── /requests                - View service requests
├── /requests/:id            - View specific request details
├── /requests/new            - Create new service request
├── /history                 - Service history
└── /profile                 - Customer profile settings
```

### Mechanic Routes (Future)

```
/mechanic/
├── /dashboard               - Mechanic dashboard (current placeholder)
├── /services                - Manage service offerings
├── /services/new            - Add new service
├── /services/:id/edit       - Edit service
├── /requests                - View incoming requests
├── /requests/:id            - View specific request
├── /active                  - Active/ongoing services
├── /history                 - Service history
└── /profile                 - Mechanic profile settings
```

### Shared Routes (Future)

```
/profile                     - User profile (role-aware)
/settings                    - User settings
/notifications               - Notifications
/help                        - Help/support
```

## Navigation Hierarchy

```
App (AuthProvider)
  ↓
BrowserRouter
  ↓
Routes
  ├── / (RootRedirect)
  ├── /auth (AuthPage)
  ├── /customer/* (RoleBasedRoute - customer only)
  │     └── /home (CustomerHome)
  ├── /mechanic/* (RoleBasedRoute - mechanic only)
  │     └── /dashboard (MechanicDashboard)
  └── /* (Redirect to /)
```

## State Management

### AuthContext

```
Location: /src/contexts/AuthContext.jsx

Provides:
- user: Current user object { phone, role, fullName, ... }
- isAuthenticated: Boolean authentication status
- login(userData): Function to authenticate user
- logout(): Function to log out user

Used by:
- All route guards (ProtectedRoute, RoleBasedRoute)
- Navigation components
- AuthPage for login/signup
```

## Implementation Guidelines

### Adding a New Route

1. Create the component in appropriate folder:

   - Customer: `/src/pages/customer/[FeatureName]/`
   - Mechanic: `/src/pages/mechanic/[FeatureName]/`

2. Add route to App.jsx:

```jsx
<Route
  path="/customer/new-feature"
  element={
    <RoleBasedRoute allowedRole="customer">
      <NewFeatureComponent />
    </RoleBasedRoute>
  }
/>
```

3. Use `useNavigate()` for programmatic navigation:

```jsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/customer/mechanics");
```

### Adding Navigation Links

```jsx
import { Link } from "react-router-dom";

<Link to="/customer/mechanics">Find Mechanics</Link>;
```

## Security Considerations

1. **Role Validation**: Always use `RoleBasedRoute` for role-specific pages
2. **Authentication Check**: All protected routes check `isAuthenticated`
3. **No Hardcoded Roles**: Role values come from user object, not hardcoded
4. **Redirect on Auth Change**: User logout automatically redirects to `/auth`
5. **API Integration**: Current auth is mock - replace with real API calls

## Testing Navigation

### Test Cases

1. Unauthenticated user accessing root → Should redirect to /auth
2. Unauthenticated user accessing /customer/home → Should redirect to /auth
3. Customer logging in → Should redirect to /customer/home
4. Mechanic logging in → Should redirect to /mechanic/dashboard
5. Customer accessing /mechanic/dashboard → Should redirect to /customer/home
6. Mechanic accessing /customer/home → Should redirect to /mechanic/dashboard
7. Invalid route → Should redirect to / (then follow authentication flow)

## Notes

- **Current State**: All pages are text placeholders
- **Phone Only**: Authentication uses phone number only (no email/social login)
- **Mock Auth**: Login currently uses mock authentication
- **Scalable**: Structure supports easy addition of new routes
- **Type Safety**: Consider adding TypeScript for better route typing in future
