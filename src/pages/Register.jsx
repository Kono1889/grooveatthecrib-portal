import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import useStore from "../store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StylishLoader from "../components/StylishLoader";
import SuccessAnimation from "../components/SuccessAnimation";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);
  const currentUser = useStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation controls
  const formControls = useAnimation();
  const inputControls = useAnimation();
  const buttonControls = useAnimation();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(`/welcome/${currentUser._id}`, { replace: true });
    }
  }, [currentUser, navigate]);

  // Animate form entry on mount
  useEffect(() => {
    const sequence = async () => {
      // Form slide up
      await formControls.start({ opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } });

      // Animate inputs staggered
      await inputControls.start(i => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, type: "spring", stiffness: 140, damping: 12 }
      }));

      // Start button shake every 4s
      const shakeButton = () => {
        buttonControls.start({
          x: [0, -5, 5, -4, 4, -2, 2, 0],
          rotate: [0, -2, 2, -1, 1, 0],
          transition: { duration: 0.6, ease: "easeInOut" },
        });
      };
      shakeButton();
      const interval = setInterval(shakeButton, 4000);

      return () => clearInterval(interval);
    };
    sequence();
  }, [formControls, inputControls, buttonControls]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await registerUser(data);
      if (response?.data?.user) {
        setUser(response.data.user);
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/welcome/${response.data.user._id}`, { replace: true });
        }, 2000);
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative">
      <ToastContainer />
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation
            message="Registration Successful! 🎉"
            onComplete={() =>
              navigate(`/welcome/${useStore.getState().user._id}`, { replace: true })
            }
          />
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <StylishLoader size="lg" text="Registering..." />
        </div>
      )}

      {/* Form container */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 50 }}
        animate={formControls}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center"
      >
        <motion.h2
          className="text-2xl font-bold mb-6 text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 15 } }}
        >
          Event Registration
        </motion.h2>

        {/* Inputs */}
        {["fullName", "email", "phone"].map((field, i) => (
          <motion.div
            key={field}
            custom={i}
            initial={{ opacity: 0, y: 30 }}
            animate={inputControls}
            className="w-full"
          >
            <input
              {...register(field, {
                required: `${field === "phone" ? "Phone number" : field.charAt(0).toUpperCase() + field.slice(1)} is required`,
                pattern:
                  field === "email"
                    ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                    : field === "phone"
                    ? { value: /^\+\d{10,15}$/, message: "Use international format e.g. +233XXXXXXXXX" }
                    : undefined,
              })}
              placeholder={
                field === "phone" ? "+233XXXXXXXXX" : field === "email" ? "Email Address" : "Full Name"
              }
              className="w-full mb-2 p-3 border rounded-lg"
            />
            {errors[field] && (
              <p className="text-red-500 text-sm mb-3">{errors[field].message}</p>
            )}
          </motion.div>
        ))}

        <motion.label
          className="flex items-center gap-2 mb-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.5, type: "spring", stiffness: 140, damping: 12 } }}
        >
          <input type="checkbox" {...register("subscribed")} defaultChecked />
          Subscribe to updates
        </motion.label>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || loading}
          animate={buttonControls}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isSubmitting || loading ? "Submitting..." : "Submit"}
        </motion.button>
      </motion.form>
    </div>
  );
}
