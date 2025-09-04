import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("unify-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("unify-theme", theme);
    set({ theme });
  },
}));