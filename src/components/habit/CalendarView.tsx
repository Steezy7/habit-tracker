import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHabitStore } from "@/store/habitStore";

export function CalendarView() {
  const { habits } = useHabitStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const completionMap = useMemo(() => {
    const map: Record<string, number> = {};
    habits.forEach((h) => {
      h.completions.forEach((d) => {
        map[d] = (map[d] || 0) + 1;
      });
    });
    return map;
  }, [habits]);

  const totalHabits = habits.length || 1;
  const today = new Date().toISOString().split("T")[0];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selectedHabits = selectedDate
    ? habits.filter((h) => h.completions.includes(selectedDate))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="bg-card rounded-2xl border border-border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-sm font-bold text-foreground">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const count = completionMap[dateStr] || 0;
            const ratio = count / totalHabits;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                className={`relative aspect-square rounded-xl text-xs font-medium flex items-center justify-center transition-all active:scale-95 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isToday
                    ? "ring-2 ring-primary/40 text-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {day}
                {count > 0 && !isSelected && (
                  <div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all"
                    style={{ opacity: Math.max(0.3, ratio) }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <h4 className="text-sm font-bold text-foreground mb-3">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h4>
          {selectedHabits.length === 0 ? (
            <p className="text-xs text-muted-foreground">No habits completed on this day</p>
          ) : (
            <div className="space-y-2">
              {selectedHabits.map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-sm">
                  <span className={`category-dot category-${h.category}`} />
                  <span className="text-foreground">{h.name}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
