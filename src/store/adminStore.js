import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useAdminStore = create(
  devtools((set, get) => ({
    adminToken: localStorage.getItem("adminToken") || null,
    adminTokenExpiry: parseInt(
      localStorage.getItem("adminTokenExpiry") || "0",
      10
    ),
    isAuthenticated: false,
    loginAttempts: 0,
    lastLoginAttemptTime: 0,
    isLocked: false,

    // Check if token is valid and not expired
    isTokenValid: () => {
      const { adminToken, adminTokenExpiry } = get();
      if (!adminToken) return false;
      const now = Date.now();
      return now < adminTokenExpiry;
    },

    // Login with token
    login: (token, expiryMinutes = 60) => {
      const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminTokenExpiry", expiryTime.toString());
      set({
        adminToken: token,
        adminTokenExpiry: expiryTime,
        isAuthenticated: true,
        loginAttempts: 0,
        isLocked: false,
      });
    },

    // Logout and clear session
    logout: () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminTokenExpiry");
      set({
        adminToken: null,
        adminTokenExpiry: 0,
        isAuthenticated: false,
        loginAttempts: 0,
      });
    },

    // Record failed login attempt
    recordFailedAttempt: () => {
      const { loginAttempts, lastLoginAttemptTime } = get();
      const now = Date.now();
      const timeSinceLastAttempt = now - lastLoginAttemptTime;

      // Reset attempts if more than 15 minutes have passed
      let newAttempts =
        timeSinceLastAttempt > 15 * 60 * 1000 ? 1 : loginAttempts + 1;
      const isLocked = newAttempts >= 5; // Lock after 5 failed attempts

      set({
        loginAttempts: newAttempts,
        lastLoginAttemptTime: now,
        isLocked,
      });

      return { newAttempts, isLocked };
    },

    // Clear lock after timeout
    clearLock: () => {
      set({
        loginAttempts: 0,
        isLocked: false,
        lastLoginAttemptTime: 0,
      });
    },

    // Verify token is still valid on app load
    verifySession: () => {
      if (get().isTokenValid()) {
        set({ isAuthenticated: true });
        return true;
      } else {
        get().logout();
        return false;
      }
    },
  }))
);

export default useAdminStore;
