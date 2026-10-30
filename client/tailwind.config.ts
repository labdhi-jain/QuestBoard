import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1340',
        cream: '#FFF8EC',
        violet: {
          DEFAULT: '#6C3BFF',
          dark: '#5426E0',
          light: '#885FFF',
        },
        pink: {
          DEFAULT: '#FF4FA3',
          dark: '#E03387',
          light: '#FF73B8',
        },
        yellow: {
          DEFAULT: '#FFD23F',
          dark: '#E6B81C',
          light: '#FFE073',
        },
        mint: {
          DEFAULT: '#2EE6A6',
          dark: '#1EC78C',
          light: '#5BF2BF',
        },
        sky: {
          DEFAULT: '#3DC8FF',
          dark: '#1FAEE6',
          light: '#6FDBFF',
        },
        tangerine: {
          DEFAULT: '#FF7A3D',
          dark: '#E65D1E',
          light: '#FF9768',
        },
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderWidth: {
        '2.5': '2.5px',
        '3': '3px',
      },
      boxShadow: {
        hard: '4px 4px 0px #1B1340',
        'hard-sm': '2px 2px 0px #1B1340',
        'hard-lg': '6px 6px 0px #1B1340',
        'hard-xl': '8px 8px 0px #1B1340',
        'hard-pressed': '1px 1px 0px #1B1340',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
