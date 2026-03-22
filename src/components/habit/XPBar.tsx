import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useHabitStore, xpForLevel, xpProgress } from "@/store/habitStore";

export function XPBar() {
  const { xp, level } = useHabitStore();
  const needed = xpForLevel(level);
  const current = xpProgress(xp, level);
  const pct = Math.min((current / needed) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary">Lv.{level}</span>
      </div>
      <div className="flex-1">
        <div className="h-2.5 rounded-full xp-bar-track overflow-hidden">
          <motion.div
            className="h-full rounded-full xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium tabular-nums">
        {current}/{needed} XP
      </span>
    </div>
  );
}
