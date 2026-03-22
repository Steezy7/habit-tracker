import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import {
  Habit,
  Category,
  Frequency,
  CATEGORIES,
  useHabitStore,
  getHabitSuggestions,
} from "@/store/habitStore";

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  editHabit?: Habit | null;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AddHabitModal({ open, onClose, editHabit }: AddHabitModalProps) {
  const { addHabit, updateHabit, habits } = useHabitStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("health");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const suggestions = getHabitSuggestions(habits);

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setCategory(editHabit.category);
      setFrequency(editHabit.frequency);
      setCustomDays(editHabit.customDays || [1, 3, 5]);
      setTimeOfDay(editHabit.timeOfDay || "");
      setReminderTime(editHabit.reminderTime || "");
    } else {
      setName("");
      setCategory("health");
      setFrequency("daily");
      setCustomDays([1, 3, 5]);
      setTimeOfDay("");
      setReminderTime("");
    }
  }, [editHabit, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      category,
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      timeOfDay: timeOfDay || undefined,
      reminderTime: reminderTime || undefined,
    };

    if (editHabit) {
      updateHabit(editHabit.id, data);
    } else {
      addHabit(data);
    }
    onClose();
  }

  function toggleDay(day: number) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-bold text-foreground">
                {editHabit ? "Edit Habit" : "New Habit"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Suggestions */}
              {!editHabit && suggestions.length > 0 && !name && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Suggestions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setName(s)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning run"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                        category === c.value
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-secondary text-secondary-foreground border border-transparent hover:border-border"
                      }`}
                    >
                      <span className={`category-dot category-${c.value}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Frequency
                </label>
                <div className="flex gap-2">
                  {(["daily", "weekly", "custom"] as Frequency[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all active:scale-95 ${
                        frequency === f
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {frequency === "custom" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="flex gap-1.5 mt-3"
                  >
                    {DAYS.map((d, i) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`w-10 h-10 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                          customDays.includes(i)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Time & Reminder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Time of Day
                  </label>
                  <input
                    type="time"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Reminder
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editHabit ? "Save Changes" : "Create Habit"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
