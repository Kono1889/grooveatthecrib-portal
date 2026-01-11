import React from "react";
import { motion } from "framer-motion";
import skating from "../assets/roller-skating.svg";
import Snowfall from "react-snowfall";

export default function ThankYou() {
  return (
    <motion.div
      className="min-h-screen relative flex flex-col items-center justify-center bg-[#F5FBE6] px-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Snowfall / Celebration */}
      <Snowfall color="teal" snowflakeCount={120} />

      {/* Card */}
      <motion.div
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-md text-center z-10 border border-white/40"
        initial={{ y: 60, opacity: 0, scale: 0.85 }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 12,
        }}
        whileHover={{
          y: -4,
        }}
      >
        {/* Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-teal-600 mb-4 drop-shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Thank You!
        </motion.h1>
        {/* Image */}
        <motion.img
          src={skating}
          alt="Thank You Illustration"
          className="w-48 h-48 mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: [
              "drop-shadow(0 0 10px rgba(14,165,233,0.4))",
              "drop-shadow(0 0 25px rgba(14,165,233,0.8))",
              "drop-shadow(0 0 10px rgba(14,165,233,0.4))",
            ],
          }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 130,
            damping: 15,
            filter: {
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Text */}
        <motion.p
          className="text-gray-800 mb-6 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          Your response has been successfully recorded! A ticket will be approved by the admin to your mail.
        </motion.p>

        {/* Button */}
        <motion.button
          onClick={() => (window.location.href = "/")}
          className="bg-gradient-to-r from-teal-900 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          whileHover={{
            scale: 1.07,
            boxShadow: "0px 0px 20px rgba(14,165,233,0.6)",
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Go Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
