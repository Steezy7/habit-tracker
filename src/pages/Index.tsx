import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { HabitCard } from "@/components/habit/HabitCard";
import { AddHabitModal } from "@/components/habit/AddHabitModal";
import { CalendarView } from "@/components/habit/CalendarView";
import { ProgressDashboard } from "@/components/habit/ProgressDashboard";
import { useHabitStore, getToday, isHabitDueOnDate, Habit } from "@/store/habitStore";

type View = "today" | "calendar" | "progress";

const MOTIVATIONAL = [
  "You're building something great 💪",
  "Every check counts 🔥",
  "Consistency is your superpower ⚡",
  "Small steps, big results 🚀",
];

export default function Index() {
  const [view, setView] = useState<View>("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const habits = useHabitStore((s) => s.habits);
  const today = getToday();

  const todaysHabits = habits.filter((h) => isHabitDueOnDate(h, today));
  const completedCount = todaysHabits.filter((h) => h.completions.includes(today)).length;

  const motivation = MOTIVATIONAL[Math.floor(Date.now() / 86400000) % MOTIVATIONAL.length];

  function handleEdit(habit: Habit) {
    setEditHabit(habit);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditHabit(null);
  }

  return (
    <AppLayout view={view} onViewChange={setView} onAddHabit={() => setModalOpen(true)}>
      <AnimatePresence mode="wait">
        {view === "today" && (
          <motion.div
            key="today"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-extrabold tracking-tight text-foreground text-balance"
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                {motivation}
              </motion.p>
              {todaysHabits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(completedCount / todaysHabits.length) * 100}%`,
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                      {completedCount}/{todaysHabits.length}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Habit list */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {todaysHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} onEdit={handleEdit} />
                ))}
              </AnimatePresence>

              {todaysHabits.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">No habits yet</p>
                  <p className="text-xs text-muted-foreground mb-5">
                    Start building better routines today
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    Create Your First Habit
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {view === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-6">
              Calendar
            </h2>
            <CalendarView />
          </motion.div>
        )}

        {view === "progress" && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-6">
              Progress
            </h2>
            <ProgressDashboard />
          </motion.div>
        )}
      </AnimatePresence>

      <AddHabitModal open={modalOpen} onClose={handleCloseModal} editHabit={editHabit} />
    </AppLayout>
  );
}
