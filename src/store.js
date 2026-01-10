import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools((set) => ({
    user: null,
    error: null,
    setUser: (user) => set({ user }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }))
);

export default useStore;
