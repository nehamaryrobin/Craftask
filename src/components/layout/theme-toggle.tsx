'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  function toggleTheme() {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle('dark', nextTheme);
    setIsDark(nextTheme);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="theme-toggle"
    >
      <Sun aria-hidden="true" className="theme-toggle-sun" size={16} />
      <Moon aria-hidden="true" className="theme-toggle-moon" size={16} />
      <span className="sr-only">{isDark ? 'Dark mode is on' : 'Light mode is on'}</span>
    </button>
  );
}
