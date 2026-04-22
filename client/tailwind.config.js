/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Orange primary palette — formal, authoritative
        "primary":                    "#E06020",
        "primary-fixed":              "#C04500",
        "primary-fixed-dim":          "#A83800",
        "primary-dim":                "#CC5518",
        "primary-container":          "#E06020",
        "on-primary":                 "#FFFFFF",
        "on-primary-container":       "#FFFFFF",
        "on-primary-fixed":           "#FFFFFF",
        "on-primary-fixed-variant":   "#5C2200",
        "inverse-primary":            "#FF8840",

        // Warm white surfaces
        "background":                 "#FFFFFF",
        "surface":                    "#FAF8F6",
        "surface-dim":                "#EDE8E3",
        "surface-bright":             "#FFFFFF",
        "surface-variant":            "#F0ECE8",
        "surface-container-lowest":   "#FFFFFF",
        "surface-container-low":      "#F5F1EE",
        "surface-container":          "#EDE9E5",
        "surface-container-high":     "#E6E1DC",
        "surface-container-highest":  "#DDD7D1",
        "surface-tint":               "#E06020",

        // Text — deep charcoal + warm gray
        "on-surface":                 "#1A1410",
        "on-surface-variant":         "#706860",
        "on-background":              "#1A1410",
        "inverse-surface":            "#1A1410",
        "inverse-on-surface":         "#F5F1EE",

        // Borders
        "outline":                    "#A8A098",
        "outline-variant":            "#D4CEC8",

        // Secondary warm tones
        "secondary":                  "#6E5848",
        "secondary-fixed":            "#F5DDD2",
        "secondary-fixed-dim":        "#E8C9BC",
        "secondary-dim":              "#E8C9BC",
        "secondary-container":        "#F5DDD2",
        "on-secondary":               "#FFFFFF",
        "on-secondary-container":     "#2A1008",
        "on-secondary-fixed":         "#3A2015",
        "on-secondary-fixed-variant": "#5A3525",

        // Tertiary neutral tones
        "tertiary":                   "#1A1410",
        "tertiary-container":         "#F0EDEA",
        "tertiary-fixed":             "#1A1410",
        "tertiary-fixed-dim":         "#3A3430",
        "tertiary-dim":               "#F0EDEA",
        "on-tertiary":                "#FFFFFF",
        "on-tertiary-container":      "#3A3430",
        "on-tertiary-fixed":          "#F5F1EE",
        "on-tertiary-fixed-variant":  "#706860",

        // Error
        "error":                      "#BA1A1A",
        "error-container":            "#FFDAD6",
        "error-dim":                  "#CF3030",
        "on-error":                   "#FFFFFF",
        "on-error-container":         "#410002",

        // Tier colors
        'tier-common':    '#5A6A8A',
        'tier-rare':      '#3B82F6',
        'tier-epic':      '#8B5CF6',
        'tier-legendary': '#D4A017',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['Lato', 'sans-serif'],
        body:     ['Lato', 'sans-serif'],
        label:    ['Lato', 'sans-serif'],
        sans:     ['Lato', 'sans-serif'],
        mono:     ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
