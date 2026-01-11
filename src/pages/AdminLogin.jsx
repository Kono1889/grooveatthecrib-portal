import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAdminStore from "../store/adminStore";
import StylishLoader from "../components/StylishLoader";
import SuccessAnimation from "../components/SuccessAnimation";

export default function AdminLogin() {
  const navigate = useNavigate();
  const {
    login,
    recordFailedAttempt,
    clearLock,
    loginAttempts,
    isLocked,
    lastLoginAttemptTime,
  } = useAdminStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if admin is already authenticated
  useEffect(() => {
    if (
      useAdminStore.getState().isAuthenticated &&
      useAdminStore.getState().isTokenValid()
    ) {
      navigate("/admin");
    }
  }, [navigate]);

  // Countdown lockout timer
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      const timeSinceAttempt = Date.now() - lastLoginAttemptTime;
      const remaining = Math.max(0, 15 * 60 * 1000 - timeSinceAttempt); // 15 minutes
      setLockoutTimeRemaining(remaining);

      if (remaining === 0) {
        clearLock();
        toast.success("Account unlocked. You can try again.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lastLoginAttemptTime, clearLock]);

  const formatLockoutTime = (ms) => {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(
        `Account locked. Try again in ${formatLockoutTime(
          lockoutTimeRemaining
        )}`
      );
      return;
    }

    const u = username.trim();
    const p = password;
    if (!u || !p) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL 
        }/admin/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, password: p }),
        }
      );

      if (!response.ok) {
        const { message } = await response.json().catch(() => ({}));
        recordFailedAttempt();
        toast.error(message || "Invalid credentials");
        setPassword("");
        return;
      }

      const data = await response.json();
      login(data.token, data.expiryMinutes || 60);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (err) {
      console.error("Login error:", err);
      recordFailedAttempt();
      toast.error("Login failed. Please check your connection.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-6 py-12">
      <ToastContainer />
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation
            message="Login Successful! 🎉"
            onComplete={() => navigate("/admin")}
          />
        )}
      </AnimatePresence>
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <StylishLoader size="lg" text="Signing in..." />
        </div>
      )}
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-gray-600 text-sm mt-2">
            Event Management Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {isLocked && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
              <p className="text-red-800 font-semibold">
                🔒 Account Temporarily Locked
              </p>
              <p className="text-red-700 text-sm mt-1">
                Too many failed attempts. Try again in{" "}
                {formatLockoutTime(lockoutTimeRemaining)}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLocked || loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2 mt-4"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked || loading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {loginAttempts > 0 &&
                  loginAttempts < 5 &&
                  `Failed attempts: ${loginAttempts}/5`}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLocked || loading || !username.trim() || !password}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Authenticating...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔒 <strong>Security Notice:</strong> This is a secure admin area.
              Your session will expire after 60 minutes of inactivity.
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>First time?</strong> Contact your system administrator to
              create an admin account.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Lost access?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Return to Home
          </a>
        </p>
      </div>
    </div>
  );
}
