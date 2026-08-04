/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        opensans: ["Open Sans", "sans-serif"],
      },
       colors: {
        primary: "var( --ant-primary-color)",
        secondary: "var(--color--secondary)",
      },
    },
  },
  plugins: [],
};
