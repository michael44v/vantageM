/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        body: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#111111", // Vantage Black
          light: "#222222",
          dark: "#000000",
        },
        accent: {
          DEFAULT: "#FFC800", // Vantage Gold/Yellow
          light: "#FFD733",
          dark: "#CCA000",
        },
        teal: {
          DEFAULT: "#00B4A6",
          light: "#00d4c4",
          dark: "#008a80",
        },
        gold: {
          DEFAULT: "#FFC800",
          light: "#FFD733",
        },
        surface: {
          DEFAULT: "#F8F8F8",
          mid: "#EEEEEE",
          border: "#E0E0E0",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(11,30,61,0.10)",
        lg: "0 12px 48px rgba(11,30,61,0.16)",
        xl: "0 24px 64px rgba(11,30,61,0.20)",
      },
      borderRadius: {
        card: "12px",
        xl: "20px",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease both",
        "fade-in": "fadeIn 0.4s ease both",
        pulse2: "pulse2 2s infinite",
        ticker: "ticker 30s linear infinite",
        "grow-bar": "growBar 1s ease both",
        spin: "spin 0.8s linear infinite",
      },
      keyframes: {
        fadeInUp: { from: { opacity: 0, transform: "translateY(24px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        pulse2: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
        ticker: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        growBar: { from: { transform: "scaleY(0)", transformOrigin: "bottom" }, to: { transform: "scaleY(1)" } },
        spin: { to: { transform: "rotate(360deg)" } },
      },
    },
  },
  plugins: [],
}
