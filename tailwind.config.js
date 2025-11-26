/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        colors: {
            'philo-navy': {
                500: '#1e3a8a', // Primary blue
                700: '#1e293b', // Darker slate/navy
                900: '#0f172a', // Deepest navy
            },
            'philo-amber': {
                400: '#fbbf24', // Bright amber
                500: '#f59e0b', // Standard amber
                600: '#d97706', // Dark amber
            },
        },
        animation: {
            'blob': 'blob 7s infinite',
            'gradient-slow': 'gradient-slow 15s ease infinite',
            'fadeIn': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'fadeInUp': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'fadeInDown': 'fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'enter-void': 'enterVoid 0.8s cubic-bezier(0.7, 0, 0.3, 1) forwards',
            'slide-up-fade': 'slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'bounce-subtle': 'bounceSubtle 2s infinite',
            'float': 'float 6s ease-in-out infinite',
            'gel-wobble': 'gelWobble 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
            'scale-in': 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        },
        keyframes: {
            blob: {
                '0%': { transform: 'translate(0px, 0px) scale(1)' },
                '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                '100%': { transform: 'translate(0px, 0px) scale(1)' },
            },
            'gradient-slow': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
            },
            fadeIn: {
                'from': { opacity: '0' },
                'to': { opacity: '1' },
            },
            fadeInUp: {
                'from': { opacity: '0', transform: 'translateY(30px)' },
                'to': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeInDown: {
                'from': { opacity: '0', transform: 'translateY(-30px)' },
                'to': { opacity: '1', transform: 'translateY(0)' },
            },
            enterVoid: {
                '0%': { opacity: '1', transform: 'scale(1)' },
                '100%': { opacity: '0', transform: 'scale(1.5)', filter: 'blur(4px)' },
            },
            slideUpFade: {
                '0%': { opacity: '0', transform: 'translateY(40px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            bounceSubtle: {
                '0%, 100%': { transform: 'translateY(-3%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
                '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
            },
            float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
            },
            gelWobble: {
                '0%': { transform: 'scale(1, 1)' },
                '25%': { transform: 'scale(1.05, 0.95)' },
                '50%': { transform: 'scale(0.95, 1.05)' },
                '75%': { transform: 'scale(1.02, 0.98)' },
                '100%': { transform: 'scale(1, 1)' },
            },
            scaleIn: {
                '0%': { opacity: '0', transform: 'scale(0.8)' },
                '100%': { opacity: '1', transform: 'scale(1)' },
            }
        }
    },
    plugins: [],
}
