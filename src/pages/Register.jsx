import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../animations/motionVariants";
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
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const currentUser = useStore((s) => s.user);

  // If already signed in, redirect away from register page. Use replace so
  // the register page is not kept in history (prevents back button returning).
  useEffect(() => {
    if (currentUser) {
      navigate(`/welcome/${currentUser._id}`, { replace: true });
    }
  }, [currentUser, navigate]);

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
      toast.error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <ToastContainer />
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation
            message="Registration Successful! 🎉"
            onComplete={() =>
              navigate(`/welcome/${useStore.getState().user._id}`, {
                replace: true,
              })
            }
          />
        )}
      </AnimatePresence>
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <StylishLoader size="lg" text="Registering..." />
        </div>
      )}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Event Registration
        </h2>

        <input
          {...register("fullName", { required: "Full name is required" })}
          placeholder="Full Name"
          className="w-full mb-2 p-3 border rounded-lg"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mb-3">{errors.fullName.message}</p>
        )}

        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email",
            },
          })}
          placeholder="Email Address"
          className="w-full mb-2 p-3 border rounded-lg"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-3">{errors.email.message}</p>
        )}

        <input
          type="tel"
          placeholder="+233XXXXXXXXX"
          className="w-full mb-2 p-3 border rounded-lg"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^\+\d{10,15}$/,
              message: "Use international format e.g. +233XXXXXXXXX",
            },
          })}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mb-3">{errors.phone.message}</p>
        )}

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" {...register("subscribed")} defaultChecked />
          Subscribe to updates
        </label>

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isSubmitting || loading ? "Submitting..." : "Submit"}
        </button>
      </motion.form>
    </div>
  );
}
