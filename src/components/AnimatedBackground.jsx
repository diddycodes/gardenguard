import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(142 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(142 100% 50%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(142 100% 50% / 0.15), transparent 70%)" }}
        animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(285 100% 55% / 0.12), transparent 70%)" }}
        animate={{ x: [0, -80, 40, 0], y: [0, 60, -40, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(339 100% 55% / 0.1), transparent 70%)" }}
        animate={{ x: [0, 60, -80, 0], y: [0, -50, 30, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}