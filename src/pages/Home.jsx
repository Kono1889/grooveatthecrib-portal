import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import dancing from "../assets/dancing.svg";

export default function Home() {
  const imageControls = useAnimation();
  const svgControls = useAnimation();
  const pControls = useAnimation();
  const buttonControls = useAnimation();

  useEffect(() => {
    const animateEntry = async () => {
      // H1 + SVG entry
      await svgControls.start({
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 140, damping: 10 },
      });

      // Image bounce in
      await imageControls.start({
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 140, damping: 12 },
      });

      // Image swing every 10s
      const swingImage = () => {
        imageControls
          .start({ x: 15, transition: { duration: 0.3, ease: "easeInOut" } })
          .then(() =>
            imageControls.start({
              x: -15,
              transition: { duration: 0.3, ease: "easeInOut" },
            })
          )
          .then(() =>
            imageControls.start({ x: 0, transition: { duration: 0.3 } })
          );
      };
      swingImage();
      setInterval(swingImage, 10000);

      // Shake effect for paragraph (like clock ringing)
      const shake = async () => {
        await pControls.start({
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          y: [0, -3, 3, -2, 2, -1, 1, 0],
          rotate: [0, -3, 3, -2, 2, -1, 1, 0],
          transition: { duration: 0.6, ease: "easeInOut" },
        });
      };
      shake();
      setInterval(shake, 3000);

      // Shake effect for button
      const buttonShake = async () => {
        await buttonControls.start({
          x: [0, -5, 5, -3, 3, -2, 2, 0],
          y: [0, -2, 2, -1, 1, 0],
          rotate: [0, -2, 2, -1, 1, 0],
          transition: { duration: 0.5, ease: "easeInOut" },
        });
      };
      buttonShake();
      setInterval(buttonShake, 4000);
    };

    animateEntry();
  }, [imageControls, svgControls, pControls, buttonControls]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-r from-teal-900  to-teal-500">
      {/* Centered content container with light background */}
      <div className="bg-[#F5FBE6] rounded-2xl p-8 sm:p-12 sm:py-52 md:p-12 flex flex-col items-center gap-6 max-w-xl shadow-xl">
        {/* H1 */}
        <motion.h1
          className="text-3xl text-[#233D4D]  sm:text-4xl md:text-5xl font-bold flex flex-wrap justify-center items-center gap-4 sm:gap-6 "
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 12,
            delay: 0.3,
          }}
        >
          GROOVE{" "}
          <span className="text-5xl sm:text-6xl font-light text-teal-400 drop-shadow-[0_0_15px_rgba(14_165_233_0.8)]">
            @
          </span>{" "}
          THE CRIB 2026
          <motion.span animate={svgControls} initial={{ y: -50, opacity: 0 }}>
            <svg
              className="w-12 h-12 text-teal-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.8)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
              />
            </svg>
          </motion.span>
        </motion.h1>

        {/* Dancing Image */}
        <motion.img
          src={dancing}
          alt="dancing"
          className="w-48 sm:w-60 md:w-72 mb-4 drop-shadow-[0_0_20px_rgba(14,165,233,0.8)]"
          initial={{ y: -50, opacity: 0 }}
          animate={imageControls}
        />

        {/* Paragraph */}
        <motion.p
          className="text-[#233D4D] text-xs sm:text-base  md:text-lg mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 12 },
          }}
        >
          Join us this June for an Epic and Memorable Event.
        </motion.p>

        {/* Register Button */}
        <motion.div animate={buttonControls}>
          <Link
            to="/register"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-teal-900  to-teal-500 text-white font-bold shadow-lg border-none hover:scale-105 hover:shadow-cyan-500/70 transition-transform duration-300"
          >
            Register Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
