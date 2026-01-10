// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function SuccessAnimation({ message = "Success!", onComplete }) {
  const containerVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        delay: 0.2,
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Checkmark Circle */}
        <motion.div
          className="relative w-24 h-24"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Circle Background */}
            <circle cx="50" cy="50" r="45" fill="#10b981" opacity="0.1" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
            />

            {/* Checkmark */}
            <motion.path
              d="M 30 50 L 45 65 L 70 35"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
            />
          </svg>
        </motion.div>

        {/* Message */}
        <motion.h2
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {message}
        </motion.h2>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-2xl"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}
