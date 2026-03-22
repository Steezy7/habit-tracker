import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Trash2, Clock, Pencil } from "lucide-react";
import { Habit, useHabitStore, getToday } from "@/store/habitStore";
import { useState } from "react";

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const today = getToday();
  const isCompleted = habit.completions.includes(today);
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
          isCompleted
            ? "bg-primary/5 border-primary/20 shadow-[0_2px_16px_-4px_hsl(var(--primary)/0.15)]"
            : "bg-card border-border hover:border-primary/20 hover:shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.1)]"
        }`}
      >
        {/* Completion toggle */}
        <button
          onClick={() => toggleCompletion(habit.id, today)}
          className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
            isCompleted
              ? "bg-primary text-primary-foreground shadow-md"
              : "border-2 border-muted-foreground/20 hover:border-primary/50"
          }`}
        >
          <AnimatePresence mode="wait">
            {isCompleted && (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-5 h-5" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`category-dot category-${habit.category}`} />
            <span
              className={`font-semibold text-sm transition-all duration-300 ${
                isCompleted ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {habit.name}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground capitalize">{habit.category}</span>
            {habit.timeOfDay && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {habit.timeOfDay}
              </span>
            )}
          </div>
        </div>

        {/* Streak */}
        {habit.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-streak/10"
          >
            <Flame className="w-4 h-4 text-streak streak-fire" />
            <span className="text-xs font-bold text-streak">{habit.streak}</span>
          </motion.div>
        )}

        {/* Action buttons */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-1"
            >
              <button
                onClick={() => onEdit(habit)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
