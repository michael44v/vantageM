/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0B1E3D",
          light: "#1a3560",
          dark: "#071428",
        },
        accent: {
          DEFAULT: "#E8500A",
          light: "#FF6B35",
          dark: "#c43e00",
        },
        teal: {
          DEFAULT: "#00B4A6",
          light: "#00d4c4",
          dark: "#008a80",
        },
        gold: {
          DEFAULT: "#F5A623",
          light: "#ffcc55",
        },
        surface: {
          DEFAULT: "#F4F6FA",
          mid: "#EEF1F8",
          border: "#DDE3EE",
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
