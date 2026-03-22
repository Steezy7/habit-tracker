import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Category = "health" | "study" | "fitness" | "mindfulness" | "productivity" | "other";
export type Frequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  customDays?: number[]; // 0=Sun..6=Sat
  timeOfDay?: string;
  reminderTime?: string;
  createdAt: string;
  completions: string[]; // ISO date strings
  streak: number;
  longestStreak: number;
  order: number;
}

export interface HabitState {
  habits: Habit[];
  xp: number;
  level: number;
  totalCompleted: number;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completions" | "streak" | "longestStreak" | "order">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: string) => void;
  reorderHabits: (habits: Habit[]) => void;
}

const XP_PER_COMPLETION = 15;
const XP_STREAK_BONUS = [
  { threshold: 7, bonus: 50 },
  { threshold: 30, bonus: 200 },
  { threshold: 100, bonus: 500 },
];

function calcLevel(xp: number): number {
  // Each level requires more XP: level N needs N*100 XP
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 100) {
    remaining -= level * 100;
    level++;
  }
  return level;
}

function calcStreak(completions: string[], today: string): number {
  if (!completions.includes(today)) return 0;
  const sorted = [...completions].sort().reverse();
  let streak = 0;
  const d = new Date(today);
  for (let i = 0; i < 365; i++) {
    const check = d.toISOString().split("T")[0];
    if (sorted.includes(check)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      xp: 0,
      level: 1,
      totalCompleted: 0,

      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              completions: [],
              streak: 0,
              longestStreak: 0,
              order: state.habits.length,
            },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      toggleCompletion: (id, date) =>
        set((state) => {
          const habit = state.habits.find((h) => h.id === id);
          if (!habit) return state;

          const wasCompleted = habit.completions.includes(date);
          const newCompletions = wasCompleted
            ? habit.completions.filter((d) => d !== date)
            : [...habit.completions, date];

          const newStreak = calcStreak(newCompletions, date);
          const newLongest = Math.max(habit.longestStreak, newStreak);

          let xpDelta = wasCompleted ? -XP_PER_COMPLETION : XP_PER_COMPLETION;
          if (!wasCompleted) {
            for (const { threshold, bonus } of XP_STREAK_BONUS) {
              if (newStreak === threshold) xpDelta += bonus;
            }
          }

          const newXp = Math.max(0, state.xp + xpDelta);

          return {
            habits: state.habits.map((h) =>
              h.id === id
                ? { ...h, completions: newCompletions, streak: newStreak, longestStreak: newLongest }
                : h
            ),
            xp: newXp,
            level: calcLevel(newXp),
            totalCompleted: state.totalCompleted + (wasCompleted ? -1 : 1),
          };
        }),

      reorderHabits: (habits) => set({ habits }),
    }),
    {
      name: "habit-tracker-storage",
    }
  )
);

// Utility to get today's date string
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Check if habit is due on a given date
export function isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === "daily") return true;
  const d = new Date(dateStr);
  if (habit.frequency === "weekly") return d.getDay() === 1; // Monday
  if (habit.frequency === "custom" && habit.customDays) {
    return habit.customDays.includes(d.getDay());
  }
  return true;
}

// XP needed for current level
export function xpForLevel(level: number): number {
  return level * 100;
}

export function xpProgress(xp: number, level: number): number {
  let remaining = xp;
  for (let l = 1; l < level; l++) remaining -= l * 100;
  return remaining;
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "study", label: "Study" },
  { value: "fitness", label: "Fitness" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "productivity", label: "Productivity" },
  { value: "other", label: "Other" },
];

export function getHabitSuggestions(habits: Habit[]): string[] {
  const suggestions: string[] = [];
  const categories = habits.map((h) => h.category);
  
  if (categories.includes("study") && !habits.some(h => h.name.toLowerCase().includes("break"))) {
    suggestions.push("Take a study break");
  }
  if (categories.includes("fitness") && !habits.some(h => h.name.toLowerCase().includes("stretch"))) {
    suggestions.push("Morning stretching");
  }
  if (!categories.includes("mindfulness")) {
    suggestions.push("5-minute meditation");
  }
  if (!habits.some(h => h.name.toLowerCase().includes("water"))) {
    suggestions.push("Drink 8 glasses of water");
  }
  if (!habits.some(h => h.name.toLowerCase().includes("read"))) {
    suggestions.push("Read for 20 minutes");
  }
  if (categories.includes("productivity") && !habits.some(h => h.name.toLowerCase().includes("journal"))) {
    suggestions.push("Evening journaling");
  }
  
  return suggestions.slice(0, 3);
}
