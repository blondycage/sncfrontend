import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		screens: {
  			'xs': '475px',
  		},
  		fontFamily: {
  			'sans': ['Lexend', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			blue: {
  				DEFAULT: 'hsl(217 91% 60%)',
  				50: 'hsl(217 91% 95%)',
  				100: 'hsl(217 91% 90%)',
  				200: 'hsl(217 91% 80%)',
  				300: 'hsl(217 91% 70%)',
  				400: 'hsl(217 91% 60%)',
  				500: 'hsl(217 91% 50%)',
  				600: 'hsl(217 91% 40%)',
  				700: 'hsl(217 91% 30%)',
  				800: 'hsl(217 91% 20%)',
  				900: 'hsl(217 91% 10%)'
  			},
  			red: {
  				DEFAULT: 'hsl(0 84% 60%)',
  				50: 'hsl(0 84% 95%)',
  				100: 'hsl(0 84% 90%)',
  				200: 'hsl(0 84% 80%)',
  				300: 'hsl(0 84% 70%)',
  				400: 'hsl(0 84% 60%)',
  				500: 'hsl(0 84% 50%)',
  				600: 'hsl(0 84% 40%)',
  				700: 'hsl(0 84% 30%)',
  				800: 'hsl(0 84% 20%)',
  				900: 'hsl(0 84% 10%)'
  			},
  			purple: {
  				50: 'hsl(270 70% 97%)',
  				100: 'hsl(270 60% 93%)',
  				200: 'hsl(270 55% 86%)',
  				300: 'hsl(270 50% 75%)',
  				400: 'hsl(270 45% 65%)',
  				500: 'hsl(270 50% 55%)',
  				600: 'hsl(270 55% 45%)',
  				700: 'hsl(270 60% 35%)',
  				800: 'hsl(270 65% 25%)',
  				900: 'hsl(270 70% 15%)'
  			},
  			teal: {
  				50: 'hsl(180 60% 97%)',
  				100: 'hsl(180 55% 93%)',
  				200: 'hsl(180 50% 85%)',
  				300: 'hsl(180 45% 75%)',
  				400: 'hsl(180 40% 65%)',
  				500: 'hsl(180 45% 50%)',
  				600: 'hsl(180 50% 40%)',
  				700: 'hsl(180 55% 30%)',
  				800: 'hsl(180 60% 20%)',
  				900: 'hsl(180 65% 10%)'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-soft': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
  			'gradient-blue': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
  			'gradient-purple': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
  			'gradient-teal': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
  			'gradient-orange': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
  			'gradient-green': 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 98%) 100%)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
