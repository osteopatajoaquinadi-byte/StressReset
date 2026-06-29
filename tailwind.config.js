/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper:      "#FBFAF7",
        bone:       "#F0F4F1",
        "bone-soft":"#E6EBE8",
        ink:        "#0F1419",
        "ink-soft": "#2A3138",
        mute:       "#6B7280",
        line:       "#D8DCD6",
        chloro:     "#1E5F3F",
        "chloro-deep": "#164A30",
        sage:       "#5B7A6A",
        "sage-soft":"#EBF1ED",
        gold:       "#C49A3F",
        "gold-soft":"#FAF4E4",
        good:       "#2F7A52",
        warn:       "#B8651E",
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
