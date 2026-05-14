/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fbfaf5',
                    100: '#f6f2e6',
                    200: '#eee3cd',
                    300: '#e3cfa8',
                    400: '#d5b67a',
                    500: '#c59b4c',
                    600: '#b1823b',
                    700: '#946633',
                    800: '#7a522f',
                    900: '#64432a',
                }
            }
        },
    },
    plugins: [],
}
