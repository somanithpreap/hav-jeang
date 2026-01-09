# Hav Jeang - Frontend Documentation

> Complete guide to understanding and working with the Hav Jeang frontend application.

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Getting Started](#-getting-started)
4. [Project Structure](#-project-structure)
5. [Routing & Authentication](#-routing--authentication)
6. [Animations System](#-animations-system)
7. [UI/UX Patterns](#-uiux-patterns)
8. [Development Guide](#-development-guide)
9. [Code Standards](#-code-standards)

---

## 🎯 Project Overview

**Hav Jeang** is a mechanic service platform connecting customers with nearby mechanics for emergency roadside assistance.

**Key Features**:

- 🗺️ Real-time mechanic location tracking
- 🔍 Smart search with autocomplete
- 📱 Mobile-first responsive design
- 🎨 Smooth animations and micro-interactions
- 🔐 Role-based authentication (Customer/Mechanic)
- 📍 GPS location services

---

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.0
- **Routing**: React Router DOM 7.11.0
- **Styling**: Tailwind CSS 4.1.18
- **Animations**: Framer Motion 12.24.10
- **Maps**: Leaflet 1.9.4 + React Leaflet 5.0.0
- **Icons**: Lucide React 0.562.0
- **UI Components**: shadcn/ui (Radix UI)

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

The app runs on `http://localhost:5175` by default.

**Requirements**:

- Node.js 18+ recommended
- HTTPS for geolocation features (production)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # Entry point
│   │
│   ├── pages/                     # Page components
│   │   ├── auth/
│   │   │   └── AuthPage.jsx      # Login/Signup
│   │   ├── customer/
│   │   │   ├── Home/             # Customer home (main feature)
│   │   │   ├── History/          # Service history
│   │   │   └── Saved/            # Saved mechanics
│   │   └── mechanic/
│   │       └── Dashboard/        # Mechanic dashboard
│   │
│   ├── components/               # Reusable components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── shared/               # Shared components
│   │       ├── ProtectedRoute.jsx
│   │       └── RoleBasedRoute.jsx
│   │
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.jsx      # Authentication state
│   │
│   ├── lib/                      # Utilities & configs
│   │   ├── animations.js        # Framer Motion variants
│   │   └── utils.js             # Helper functions
│   │
│   └── data/                     # Mock data
│       └── mockData.js          # Test data
│
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Dependencies

```

---

## 🔐 Routing & Authentication

### Route Structure

```
/                        → Redirect based on auth status
/auth                    → Login/Signup (public)
/customer/home           → Customer home (protected)
/mechanic/dashboard      → Mechanic dashboard (protected)
```

### Authentication Flow

```
User visits app
    ↓
Check authentication
    ↓
Not authenticated? → /auth
    ↓
Login/Signup
    ↓
Select role (Customer/Mechanic)
    ↓
Authenticated → Redirect by role
    ↓
Customer → /customer/home
Mechanic → /mechanic/dashboard
```

### Implementation

**App.jsx**:

```javascript
<Routes>
  <Route path="/auth" element={<AuthPage />} />

  <Route
    path="/customer/home"
    element={
      <RoleBasedRoute allowedRole="customer">
        <CustomerHome />
      </RoleBasedRoute>
    }
  />

  <Route
    path="/mechanic/dashboard"
    element={
      <RoleBasedRoute allowedRole="mechanic">
        <MechanicDashboard />
      </RoleBasedRoute>
    }
  />

  <Route path="/" element={<RootRedirect />} />
</Routes>
```

**AuthContext**:

- Provides: `user`, `role`, `login()`, `logout()`
- Manages authentication state globally
- Persists session (localStorage or session storage)

**RoleBasedRoute**:

- Checks if user has required role
- Redirects to `/auth` if not authenticated
- Shows error if wrong role

---

## 🎨 Animations System

### Animation Library

All animations are defined in `/lib/animations.js` for consistency and reusability.

**Available Variants**:

```javascript
// Fade animations
fadeIn, fadeInUp, fadeInDown;

// Slide animations
slideUp, slideDown, slideInLeft, slideInRight;

// Scale animations
scaleIn, scaleInCenter;

// Special effects
backdropFade; // Modal backdrop
staggerContainer; // Parent for stagger
staggerItem; // Child items (50ms delay)
buttonTap; // Button press (scale: 0.95)
pulse; // Infinite pulse
shimmer; // Loading shimmer
cardHover; // Card hover effect
modalContent; // Modal entrance
pageTransition; // Page transitions
skeletonPulse; // Loading skeleton
```

### Usage Examples

**Simple Fade In**:

```jsx
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

<motion.div {...fadeIn}>Content</motion.div>;
```

**Button with Press Feedback**:

```jsx
<motion.button whileTap={{ scale: 0.95 }}>Click me</motion.button>
```

**Stagger List Items**:

```jsx
import { staggerContainer, staggerItem } from "@/lib/animations";

<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.name}
    </motion.div>
  ))}
</motion.div>;
```

**Conditional Rendering with Exit**:

```jsx
import { AnimatePresence } from "framer-motion";

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>;
```

**Page Transitions**:

```jsx
import { pageTransition } from "@/lib/animations";

<AnimatePresence mode="wait">
  <motion.div key={activeTab} {...pageTransition}>
    {renderContent()}
  </motion.div>
</AnimatePresence>;
```

### Animation Principles

✅ **DO**:

- Use GPU-accelerated properties (`transform`, `opacity`)
- Keep duration under 300ms for UI interactions
- Use spring physics for natural feel
- Apply easing curves for smooth motion

❌ **DON'T**:

- Animate layout properties (`width`, `height`, `margin`)
- Create new animations (reuse existing ones)
- Use animations for large lists (>50 items)
- Animate on every state change

---

## 🎨 UI/UX Patterns

### Design System

**Colors**:

- Primary: Custom (defined in Tailwind config)
- Success: Green
- Error: Red
- Warning: Yellow
- Info: Blue

**Typography**:

- Font: System font stack (optimized for performance)
- Sizes: Tailwind's default scale
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Spacing**:

- Base unit: 4px (Tailwind's default)
- Common gaps: 2, 3, 4, 6, 8
- Card padding: p-4, p-5, p-6

### Component Patterns

**Cards**:

```jsx
<Card className="shadow-md hover:shadow-xl transition-shadow">
  <CardContent className="p-5">Content</CardContent>
</Card>
```

**Buttons**:

```jsx
<Button variant="default" size="default">
  <Icon className="w-4 h-4 mr-2" />
  Button Text
</Button>
```

**Badges**:

```jsx
<Badge variant="secondary" className="font-semibold">
  Badge Text
</Badge>
```

**Icons**:

- Size: `w-4 h-4` (16px) for buttons, `w-5 h-5` (20px) for larger UI
- Stroke width: Default (2px)
- Always include meaningful className

### Micro-Interactions

**Search Bar**:

- Icon scales when typing
- Category buttons stagger entrance
- Selected category icon rotates

**Cards**:

- Hover: Scale 1.02x
- Tap: Scale 0.98x
- Gradient backgrounds
- Icon containers with shadows

**Modals**:

- Backdrop fade (black/50)
- Content slides up + fades in
- Close with smooth exit animation

**Bottom Sheet**:

- Spring physics (damping: 30, stiffness: 300)
- Drag handle expands on hover
- Swipe gestures (80px threshold)

---

## 💻 Development Guide

### Adding a New Page

1. **Create page component**:

```bash
src/pages/customer/NewPage/NewPage.jsx
```

2. **Add route in App.jsx**:

```javascript
<Route
  path="/customer/new-page"
  element={
    <RoleBasedRoute allowedRole="customer">
      <NewPage />
    </RoleBasedRoute>
  }
/>
```

3. **Add to navigation** (Sidebar.jsx):

```javascript
<NavItem icon={Icon} label="New Page" onClick={() => onTabChange("newPage")} />
```

### Adding Mock Data

Edit `/data/mockData.js`:

```javascript
export const newData = [
  {
    id: 1,
    name: "Example",
    // ... more fields
  },
];
```

### Creating a Custom Hook

```javascript
// src/hooks/useCustomHook.js
import { useState, useEffect } from "react";

/**
 * Custom hook description
 * @param {*} param - Parameter description
 * @returns {Object} Return value description
 */
export const useCustomHook = (param) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Logic here
  }, [param]);

  return { state, setState };
};
```

### Adding an Animation

Reuse existing animations from `/lib/animations.js`. If you must create a new one:

```javascript
// In /lib/animations.js
export const newAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: easing.easeOut },
};
```

---

## 📝 Code Standards

### File Naming

```
Components:     PascalCase.jsx    (SearchBar.jsx)
Hooks:          camelCase.js      (useLocation.js)
Utils:          camelCase.js      (helpers.js)
Constants:      UPPER_SNAKE_CASE  (API_URL)
```

### Component Structure

```javascript
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Constants
const MAX_ITEMS = 10;

// 3. Component
export const MyComponent = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(null);

  // Handlers
  const handleClick = () => {
    setState((prev) => !prev);
  };

  // Render
  return (
    <div>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
};

// 4. Helper functions (if needed)
const helperFunction = () => {};
```

### Import Order

```javascript
// 1. React
import { useState, useEffect } from "react";

// 2. Third-party libraries
import { motion } from "framer-motion";

// 3. UI components
import { Button } from "@/components/ui/button";

// 4. Custom components
import { SearchBar } from "./components/SearchBar";

// 5. Hooks
import { useLocation } from "./hooks/useLocation";

// 6. Utils & constants
import { formatDate } from "@/lib/utils";

// 7. Data
import { mockData } from "@/data/mockData";

// 8. Styles (if any)
import "./styles.css";
```

### Naming Conventions

```javascript
// ✅ Good
const isLoading = true;
const hasError = false;
const canSubmit = true;
const handleSubmit = () => {};
const fetchUserData = async () => {};

// ❌ Bad
const loading = true; // Unclear type
const error = false; // Unclear type
const submit = true; // Unclear type
const onSubmit = () => {}; // Reserve 'on' for props
const getUserData = () => {}; // Use 'fetch' for async
```

### Comments

```javascript
// ✅ Good - Explains WHY
// Fallback to default location if GPS denied
const DEFAULT_LOCATION = [11.5564, 104.9282];

// Use debouncing to prevent excessive API calls
const debouncedSearch = useDebounce(searchQuery, 300);

/**
 * Calculates trip fee based on distance
 * @param {Object} mechanic - Mechanic object with lat/lng
 * @returns {number} Fee in USD
 */
const calculateTripFee = (mechanic) => {};

// ❌ Bad - Explains WHAT (obvious from code)
// Set location to coordinates
const DEFAULT_LOCATION = [11.5564, 104.9282];

// Call search function
const debouncedSearch = useDebounce(searchQuery, 300);
```

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] No `console.log()` statements (except intentional debugging)
- [ ] No ESLint warnings
- [ ] All components under 200 lines
- [ ] Animations are smooth (60fps)
- [ ] Tested in mobile view (Chrome DevTools)
- [ ] Follows naming conventions
- [ ] JSDoc added for exported functions
- [ ] No duplicate code
- [ ] No hardcoded values (use constants)

---

## 🐛 Common Issues

### Location Not Working

- Ensure HTTPS (required for geolocation)
- Check browser permissions
- Verify coordinates are valid

### Map Not Rendering

- Import Leaflet CSS: `import 'leaflet/dist/leaflet.css'`
- Ensure container has height: `className="h-full"`
- Check for valid coordinates

### Animations Laggy

- Only animate `transform` and `opacity`
- Avoid animating during scroll
- Check React DevTools for unnecessary re-renders

### Build Fails

- Clear `node_modules` and reinstall
- Check for missing dependencies
- Verify import paths are correct

---

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Leaflet](https://leafletjs.com/reference.html)
- [Lucide Icons](https://lucide.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

## 🎉 Summary

**What**: Mechanic service platform with real-time location  
**How**: React + Vite + Tailwind + Framer Motion  
**Where**: `/src/pages/customer/Home` for main features

**Key Files**:

- `App.jsx` - Routing
- `AuthContext.jsx` - Authentication
- `/lib/animations.js` - Animation system
- `/data/mockData.js` - Test data

**Next Steps**: Check `/src/pages/customer/Home/README.md` for detailed customer home documentation.

---

**Questions?** Check the code or ask the team!  
**Happy coding!** 🚀
