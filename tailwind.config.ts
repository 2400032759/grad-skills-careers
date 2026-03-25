import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#ff5757",
          purple: "#8c52ff",
        },
        slate: {
          50: "#f8fafc",
          900: "#111827",
        },
        gray: {
          600: "#4b5563",
          900: "#111827",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #ff5757 0%, #8c52ff 100%)",
      },
      fontFamily: {
        lexend: ["var(--font-lexend)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
export default config;
