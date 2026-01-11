import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import uno from "../assets/uno_card.png";

export default function ThankYou() {
  const containerRef = useRef(null);
  const confettiCount = 30; // number of confetti emojis
  const [confettiPositions] = useState(
    Array.from({ length: confettiCount }).map(() => ({
      left: Math.random() * 95,
      top: Math.random() * 10,
      emoji: [ "✨", "🥳", "💖", "🌟", "🎊"][
        Math.floor(Math.random() * 6)
      ],
    }))
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate card entrance
      gsap.from(".card", {
        y: 50,
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power3.out",
      });

      // Animate confetti continuously
      gsap.utils.toArray(".confetti").forEach((el) => {
        const duration = 4 + Math.random() * 2;
        const delay = Math.random() * 2;
        gsap.fromTo(
          el,
          { y: -50, opacity: 1, rotation: Math.random() * 360 },
          {
            y: 600,
            rotation: "+=360",
            duration,
            ease: "power1.in",
            repeat: -1,
            delay,
            yoyo: false,
          }
        );
      });

      // Button hover effect
      const btn = document.querySelector(".btn-go-home");
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, { scale: 1.05, duration: 0.2 });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { scale: 1, duration: 0.2 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 px-6 overflow-hidden"
    >
      {/* Confetti */}
      {confettiPositions.map((c, i) => (
        <span
          key={i}
          className="confetti absolute text-3xl"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
          }}
        >
          {c.emoji}
        </span>
      ))}

      {/* Card */}
      <div className="card bg-white rounded-2xl shadow-2xl p-10 max-w-md text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-4">
          Thank You!
        </h1>
        <p className="text-gray-700 mb-6 text-lg">
          Your response has been successfully recorded. We appreciate your time!
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="btn-go-home bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
