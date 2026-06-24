import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const EMOJIS = ["🎉", "🌟", "💥", "✨", "🚀", "💎", "🔥", "💯", "🛡️", "⭐"];

function ConfettiBurst() {
  useEffect(() => {
    const colors = ["#00ff66", "#cc00ff", "#ff2b6b", "#ffd700"];
    const fire = (particleRatio, opts) =>
      confetti({
        origin: { y: 0.5 },
        colors,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);
  return null;
}

function FloatingEmojis() {
  const [emojis, setEmojis] = useState([]);
  useEffect(() => {
    const items = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      scale: 0.8 + Math.random() * 1.2,
    }));
    setEmojis(items);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      {emojis.map((e) => (
        <motion.div
          key={e.id}
          initial={{ y: "100vh", opacity: 1, rotate: 0 }}
          animate={{ y: "-20vh", opacity: 0, rotate: 360 }}
          transition={{ duration: e.duration, delay: e.delay, ease: "easeOut" }}
          style={{ left: `${e.x}%`, fontSize: `${e.scale * 2}rem` }}
          className="absolute"
        >
          {e.emoji}
        </motion.div>
      ))}
    </div>
  );
}

function ScreenShake() {
  useEffect(() => {
    document.body.style.animation = "screen-shake 0.5s 3";
    const timer = setTimeout(() => {
      document.body.style.animation = "";
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

function RainbowFlash() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.4, 0.6, 0.3, 0] }}
      transition={{ duration: 2.5, times: [0, 0.2, 0.5, 0.8, 1] }}
      className="fixed inset-0 pointer-events-none z-[200]"
      style={{
        background:
          "linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #cc00ff, #ff0000)",
        backgroundSize: "200% 200%",
        animation: "gradient-shift 0.3s linear infinite",
      }}
    />
  );
}

export default function FunnyAnimation({ type }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const durations = { confetti: 3000, floating_emojis: 4500, screen_shake: 1500, rainbow_flash: 2500 };
    const timer = setTimeout(() => setShow(false), durations[type] || 3000);
    return () => clearTimeout(timer);
  }, [type]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {type === "confetti" && <ConfettiBurst />}
          {type === "floating_emojis" && <FloatingEmojis />}
          {type === "screen_shake" && <ScreenShake />}
          {type === "rainbow_flash" && <RainbowFlash />}
        </>
      )}
    </AnimatePresence>
  );
}