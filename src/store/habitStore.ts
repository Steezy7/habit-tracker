import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export type Category = "health" | "study" | "fitness" | "mindfulness" | "productivity" | "other";
export type Frequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  customDays?: number[];
  timeOfDay?: string;
  reminderTime?: string;
  createdAt: string;
  completions: string[];
  streak: number;
  longestStreak: number;
  order: number;
}

export interface HabitState {
  habits: Habit[];
  xp: number;
  level: number;
  totalCompleted: number;
  loading: boolean;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completions" | "streak" | "longestStreak" | "order">) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (id: string, date: string) => Promise<void>;
  reorderHabits: (habits: Habit[]) => void;
}

const XP_PER_COMPLETION = 15;
const XP_STREAK_BONUS = [
  { threshold: 7, bonus: 50 },
  { threshold: 30, bonus: 200 },
  { threshold: 100, bonus: 500 },
];

function calcLevel(xp: number): number {
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

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export const useHabitStore = create<HabitState>()((set, get) => ({
  habits: [],
  xp: 0,
  level: 1,
  totalCompleted: 0,
  loading: false,

  fetchHabits: async () => {
    const userId = await getUserId();
    if (!userId) return;
    set({ loading: true });

    const { data: habits } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order");

    const { data: completions } = await supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId);

    if (!habits) { set({ loading: false }); return; }

    const today = getToday();
    const mappedHabits: Habit[] = habits.map((h) => {
      const habitCompletions = (completions ?? [])
        .filter((c) => c.habit_id === h.id)
        .map((c) => c.completed_date);
      const streak = calcStreak(habitCompletions, today);
      return {
        id: h.id,
        name: h.name,
        category: h.category as Category,
        frequency: h.frequency as Frequency,
        customDays: h.custom_days ?? undefined,
        timeOfDay: h.time_of_day ?? undefined,
        reminderTime: h.reminder_time ?? undefined,
        createdAt: h.created_at,
        completions: habitCompletions,
        streak,
        longestStreak: streak, // simplified
        order: h.sort_order,
      };
    });

    const totalCompleted = (completions ?? []).length;
    const xp = totalCompleted * XP_PER_COMPLETION;

    set({
      habits: mappedHabits,
      totalCompleted,
      xp,
      level: calcLevel(xp),
      loading: false,
    });
  },

  addHabit: async (habit) => {
    const userId = await getUserId();
    if (!userId) return;

    await supabase.from("habits").insert({
      user_id: userId,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      custom_days: habit.customDays ?? null,
      time_of_day: habit.timeOfDay ?? null,
      reminder_time: habit.reminderTime ?? null,
      sort_order: get().habits.length,
    });

    await get().fetchHabits();
  },

  updateHabit: async (id, updates) => {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.customDays !== undefined) updateData.custom_days = updates.customDays;
    if (updates.timeOfDay !== undefined) updateData.time_of_day = updates.timeOfDay;
    if (updates.reminderTime !== undefined) updateData.reminder_time = updates.reminderTime;

    await supabase.from("habits").update(updateData).eq("id", id);
    await get().fetchHabits();
  },

  deleteHabit: async (id) => {
    await supabase.from("habits").delete().eq("id", id);
    await get().fetchHabits();
  },

  toggleCompletion: async (id, date) => {
    const userId = await getUserId();
    if (!userId) return;

    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return;

    const wasCompleted = habit.completions.includes(date);

    if (wasCompleted) {
      await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", id)
        .eq("completed_date", date);
    } else {
      await supabase.from("habit_completions").insert({
        habit_id: id,
        user_id: userId,
        completed_date: date,
      });
    }

    await get().fetchHabits();
  },

  reorderHabits: (habits) => set({ habits }),
}));

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === "daily") return true;
  const d = new Date(dateStr);
  if (habit.frequency === "weekly") return d.getDay() === 1;
  if (habit.frequency === "custom" && habit.customDays) {
    return habit.customDays.includes(d.getDay());
  }
  return true;
}

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

  return suggestions.slice(0, 3);
}
