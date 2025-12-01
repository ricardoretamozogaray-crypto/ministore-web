/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode via class
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Minimalist Palette
                background: {
                    DEFAULT: '#F9FAFB', // Gray 50
                    dark: '#111827',    // Gray 900
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    dark: '#1F2937',    // Gray 800
                },
                primary: {
                    DEFAULT: '#3B82F6', // Blue 500
                    hover: '#2563EB',   // Blue 600
                    light: '#EFF6FF',   // Blue 50
                },
                text: {
                    main: '#111827',    // Gray 900
                    secondary: '#6B7280', // Gray 500
                    muted: '#9CA3AF',   // Gray 400
                },
                border: {
                    DEFAULT: '#E5E7EB', // Gray 200
                    dark: '#374151',    // Gray 700
                }
            },
            boxShadow: {
                'soft': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            }
        },
    },
    plugins: [],
}
