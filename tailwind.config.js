/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#a78bfa",
        "primary-container": "#7c3aed",
        "on-primary": "#0a0012",
        "on-primary-container": "#ede9fe",
        "primary-fixed": "#ede9fe",
        "primary-fixed-dim": "#c4b5fd",
        "on-primary-fixed": "#2e1065",
        "on-primary-fixed-variant": "#5b21b6",
        "inverse-primary": "#5b21b6",

        secondary: "#71717a",
        "secondary-fixed": "#a1a1aa",
        "secondary-fixed-dim": "#71717a",
        "secondary-container": "#27272a",
        "on-secondary": "#09090b",
        "on-secondary-container": "#a1a1aa",
        "on-secondary-fixed": "#18181b",
        "on-secondary-fixed-variant": "#3f3f46",

        tertiary: "#34d399",
        "tertiary-container": "#065f46",
        "tertiary-fixed": "#bbf7d0",
        "tertiary-fixed-dim": "#6ee7b7",
        "on-tertiary": "#001a12",
        "on-tertiary-container": "#bbf7d0",
        "on-tertiary-fixed": "#003318",
        "on-tertiary-fixed-variant": "#047857",

        background: "#09090b",
        "on-background": "#fafafa",

        surface: "#0c0c0f",
        "on-surface": "#fafafa",
        "on-surface-variant": "#a1a1aa",
        "surface-bright": "#18181b",
        "surface-dim": "#0c0c0f",
        "surface-variant": "#18181b",
        "surface-tint": "#a78bfa",
        "surface-container-lowest": "#09090b",
        "surface-container-low": "#0f0f12",
        "surface-container": "#121215",
        "surface-container-high": "#18181b",
        "surface-container-highest": "#1e1e22",
        "inverse-surface": "#fafafa",
        "inverse-on-surface": "#09090b",

        outline: "#52525b",
        "outline-variant": "#27272a",

        error: "#ef4444",
        "error-container": "#3b1111",
        "on-error": "#1a0000",
        "on-error-container": "#fca5a5",
      },
      fontFamily: {
        headline: ["Geist", "Inter", "sans-serif"],
        display: ["Geist", "Inter", "sans-serif"],
        body: ["Geist", "Inter", "sans-serif"],
        label: ["Geist", "Inter", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(167, 139, 250, 0.3)",
        emerald: "0 0 25px -5px rgba(52, 211, 153, 0.3)",
      }
    },
  },
  plugins: [],
};

