/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#155DFC",
        "text-primary": "#101828",
        "text-secondary": "#6A7282",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      // Mobile-first breakpoints
      screens: {
        xs: "375px", // Small phones
        sm: "640px", // Phones
        md: "768px", // Tablets
        lg: "1024px", // Desktop
        xl: "1280px", // Large desktop
        "2xl": "1536px", // Extra large
      },
      // Spacing for mobile touch targets
      spacing: {
        safe: "max(env(safe-area-inset-top), 16px)",
        "safe-bottom": "max(env(safe-area-inset-bottom), 16px)",
      },
      // Minimum touch target sizes
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
