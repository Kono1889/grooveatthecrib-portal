// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function StylishLoader({ size = "md", text = "Loading..." }) {
  const sizes = {
    sm: { container: "w-12 h-12", dots: "w-2 h-2" },
    md: { container: "w-16 h-16", dots: "w-3 h-3" },
    lg: { container: "w-24 h-24", dots: "w-4 h-4" },
  };

  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants = {
    start: {
      y: "0%",
      opacity: 0.5,
    },
    end: {
      y: "100%",
      opacity: 1,
    },
  };

  const transitionSettings = {
    duration: 0.6,
    repeatType: "reverse",
    repeat: Infinity,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size].container} flex items-center justify-center gap-2`}
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizes[size].dots} bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full`}
            variants={dotVariants}
            transition={transitionSettings}
          />
        ))}
      </motion.div>
      {text && (
        <motion.p
          className="text-gray-600 font-medium text-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
