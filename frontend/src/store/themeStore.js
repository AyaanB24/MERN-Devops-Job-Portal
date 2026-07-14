import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark' || 
          (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),

  toggleTheme: () => {
    set((state) => {
      const newIsDark = !state.isDark;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { isDark: newIsDark };
    });
  },

  initTheme: () => {
    set((state) => {
      if (state.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return state;
    });
  },
}));
