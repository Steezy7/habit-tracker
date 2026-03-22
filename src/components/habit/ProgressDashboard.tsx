import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Target, Flame, Trophy, TrendingUp } from "lucide-react";
import { useHabitStore, getToday } from "@/store/habitStore";

export function ProgressDashboard() {
  const { habits, totalCompleted, xp } = useHabitStore();
  const today = getToday();

  const weekData = useMemo(() => {
    const days: { name: string; completed: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const completed = habits.filter((h) => h.completions.includes(dateStr)).length;
      days.push({ name: dayName, completed, total: habits.length });
    }
    return days;
  }, [habits]);

  const todayCompleted = habits.filter((h) => h.completions.includes(today)).length;
  const todayTotal = habits.length;
  const completionPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const activeStreaks = habits.filter((h) => h.streak > 0).length;

  const stats = [
    { icon: Target, label: "Today", value: `${completionPct}%`, color: "text-primary" },
    { icon: Flame, label: "Active Streaks", value: activeStreaks, color: "text-streak" },
    { icon: Trophy, label: "Best Streak", value: `${bestStreak}d`, color: "text-accent" },
    { icon: TrendingUp, label: "Total XP", value: xp.toLocaleString(), color: "text-primary" },
  ];

  const chartColor = "hsl(145, 65%, 42%)";

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">This Week</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barCategoryGap="25%">
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 24px -4px rgba(0,0,0,0.1)",
                }}
                cursor={{ fill: "hsl(var(--secondary))" }}
              />
              <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                {weekData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index === weekData.length - 1 ? chartColor : `${chartColor}66`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Completion rate */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Habit Consistency</h3>
        <div className="space-y-3">
          {habits.map((habit) => {
            const last7 = Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              return d.toISOString().split("T")[0];
            });
            const completed = last7.filter((d) => habit.completions.includes(d)).length;
            const pct = Math.round((completed / 7) * 100);

            return (
              <div key={habit.id} className="flex items-center gap-3">
                <span className={`category-dot category-${habit.category}`} />
                <span className="text-xs font-medium text-foreground flex-1 truncate">
                  {habit.name}
                </span>
                <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium tabular-nums w-8 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
          {habits.length === 0 && (
            <p className="text-xs text-muted-foreground">Add habits to see consistency data</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
