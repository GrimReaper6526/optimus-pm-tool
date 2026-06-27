/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        subtle: 'var(--bg-subtle)',
        muted: 'var(--bg-muted)',
        emphasis: 'var(--bg-emphasis)',
        surface: {
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
        },
        border: {
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          link: 'var(--text-link)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
          text: 'var(--accent-text)',
        },
        success: {
          bg: 'var(--success-bg)',
          border: 'var(--success-border)',
          text: 'var(--success-text)',
          icon: 'var(--success-icon)',
        },
        warning: {
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
          text: 'var(--warning-text)',
          icon: 'var(--warning-icon)',
        },
        error: {
          bg: 'var(--error-bg)',
          border: 'var(--error-border)',
          text: 'var(--error-text)',
          icon: 'var(--error-icon)',
        },
        info: {
          bg: 'var(--info-bg)',
          border: 'var(--info-border)',
          text: 'var(--info-text)',
          icon: 'var(--info-icon)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm, 4px)',
        md: 'var(--radius-md, 6px)',
        lg: 'var(--radius-lg, 8px)',
        xl: 'var(--radius-xl, 12px)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      }
    },
  },
  plugins: [],
}
