module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'custom-green': '#63AB45',
      },
      width: {
        '85p': '85%', // Add a custom width '90p' for 90%
      },
      height: {
        '85p': '85%', // Add a custom height '90p' for 90%
      },
      borderRadius: {
        'large': '1rem', // example for large border radius
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
