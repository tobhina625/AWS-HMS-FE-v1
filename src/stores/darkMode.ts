import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export type ThemePreference = 'light' | 'dark' | 'system';

export const useDarkModeStore = defineStore('darkMode', () => {
  // Store theme preference: 'light', 'dark', or 'system'
  const themePreference = useStorage<ThemePreference>('themePreference', 'system');

  // Detect system preference
  const systemPrefersDark = ref(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Computed dark mode based on preference
  const darkMode = computed(() => {
    if (themePreference.value === 'system') {
      return systemPrefersDark.value;
    }
    return themePreference.value === 'dark';
  });

  // Listen for system preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      systemPrefersDark.value = e.matches;
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  }

  // Apply dark mode class to document
  const applyDarkMode = (isDark: boolean) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  // Initialize on store creation
  applyDarkMode(darkMode.value);

  // Watch for dark mode changes and apply to DOM
  watch(
    darkMode,
    (newValue) => {
      applyDarkMode(newValue);
    },
    { immediate: true }
  );

  // Toggle between light and dark (not system)
  function toggleDarkMode() {
    if (themePreference.value === 'light') {
      themePreference.value = 'dark';
    } else {
      themePreference.value = 'light';
    }
  }

  // Set specific theme preference
  function setThemePreference(preference: ThemePreference) {
    themePreference.value = preference;
  }

  return {
    darkMode,
    themePreference,
    systemPrefersDark,
    toggleDarkMode,
    setThemePreference,
  };
});
