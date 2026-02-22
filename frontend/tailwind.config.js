/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                playo: {
                    primary: '#27AE60',      // main green for active, buttons
                    primaryDark: '#1E8449',
                    text: '#2C3E50',         // dark text
                    gray: {
                        text: '#7F8C8D',
                        mute: '#95A5A6',
                        border: '#E0E0E0',
                        light: '#F9F9F9',
                    },
                    surface: '#F5F5F5',      // light bg for tabs/info
                },
            },
        },
    },
    plugins: [],
}