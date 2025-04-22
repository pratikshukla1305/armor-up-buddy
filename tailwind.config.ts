
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				shield: {
					blue: '#0D2644', // Updated from #1EAEDB
					light: '#F5F8FF',
					dark: '#1A1A1A',
					gray: '#F2F2F7',
					border: '#E5E5EA'
				},
				// Updated Stripe-inspired colors - more blue-focused with #0D2644
				stripe: {
					blue: {
          DEFAULT: '#0D2644', // Updated from #0A2540
          light: '#1A3454',
          dark: '#061628',
        },
					'blue-light': '#A4CDFC',
					'blue-dark': '#0D2644', // Updated from #0A2540
					coral: '#ED5863',
					green: '#24B47E',
					'green-light': '#32D583',
					yellow: '#F7B32B',
					slate: '#0D2644', // Updated from #0A2540
					'slate-light': '#425466',
					'slate-dark': '#0D2644', // Updated from #0A2540
					gray: '#F6F9FC',
					border: '#E6EBEF',
					'border-light': '#F0F5FA',
					'border-dark': '#CAD5E0',
					'text-primary': '#0D2644', // Updated from #0A2540
					'text-secondary': '#425466',
					'text-muted': '#697386',
					cyan: '#00D4FF',
					orange: '#F7B32B'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'gradient-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'100%': { backgroundPosition: '100% 50%' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'tilt': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(1deg)' },
					'75%': { transform: 'rotate(-1deg)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'sos-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite linear',
				'gradient-shift': 'gradient-shift 10s ease infinite',
				'gradient-flow': 'gradient-flow 3s ease infinite',
				'float': 'float 6s ease-in-out infinite',
				'tilt': 'tilt 10s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
				'sos-pulse': 'sos-pulse 1s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'stripe-gradient': 'linear-gradient(135deg, #0A2540 0%, #3D9CD2 100%)',
				'stripe-dashboard': 'linear-gradient(180deg, #F6F9FC 0%, #FFFFFF 100%)',
				'security-gradient': 'linear-gradient(135deg, #0A2540 0%, #3D9CD2 100%)',
				'stripe-hero-gradient': 'linear-gradient(to bottom, #0A2540 0%, #1A3454 100%)',
				'stripe-dark-gradient': 'linear-gradient(135deg, #0A2540 0%, #1A3454 100%)',
				'stripe-blue-to-cyan': 'linear-gradient(135deg, #0A2540 0%, #00D4FF 100%)',
				'stripe-orange-to-coral': 'linear-gradient(135deg, #F7B32B 0%, #ED5863 100%)',
				'stripe-colorful': 'linear-gradient(to right, #0A2540, #3D9CD2, #F7B32B, #24B47E, #00D4FF)',
				'stripe-code-bg': 'linear-gradient(135deg, #0A2540 0%, #1A3454 100%)'
			},
			boxShadow: {
				'stripe': '0px 2px 5px rgba(0, 0, 0, 0.05)',
				'stripe-hover': '0px 4px 10px rgba(0, 0, 0, 0.1)',
				'stripe-card': '0px 8px 16px rgba(0, 0, 0, 0.05)',
				'stripe-dropdown': '0px 4px 12px rgba(0, 0, 0, 0.1)',
				'stripe-button': '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
				'stripe-button-hover': '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
