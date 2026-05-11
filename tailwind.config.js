/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      colors: {
        // ── Brand palette ──────────────────────────────────────
        brand: {
          navy: "#281C59", // deep navy/purple — primary brand
          teal: "#4E8D9C", // steel teal — secondary accent
          sage: "#85C79A", // sage green — success / positive
          lime: "#EDF7BD", // pale lime — backgrounds / highlights
          // Derived shades for hover / muted states
          "navy-dark": "#1e1545",
          "teal-dark": "#3d7080",
          "sage-dark": "#6aad80",
          "lime-dark": "#d8eda0",
        },
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
