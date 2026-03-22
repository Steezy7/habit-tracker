import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { XPBar } from "@/components/habit/XPBar";

type View = "today" | "calendar" | "progress";

interface AppLayoutProps {
  view: View;
  onViewChange: (view: View) => void;
  onAddHabit: () => void;
  children: ReactNode;
}

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "today", label: "Today", icon: LayoutDashboard },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "progress", label: "Progress", icon: BarChart3 },
];

export function AppLayout({ view, onViewChange, onAddHabit, children }: AppLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  function toggleDark() {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border bg-card z-30">
        <div className="p-6 pb-4">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Habit<span className="text-primary">Flow</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Build better habits, daily.</p>
        </div>

        <div className="px-4 mb-4">
          <XPBar />
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`nav-item w-full ${view === item.id ? "active" : ""}`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-3">
          <button
            onClick={onAddHabit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
          <button
            onClick={toggleDark}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border">
        <h1 className="text-lg font-extrabold tracking-tight text-foreground">
          Habit<span className="text-primary">Flow</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddHabit}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95"
          >
            {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-20"
          >
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l border-border p-4 pt-20"
            >
              <div className="mb-4">
                <XPBar />
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileNav(false);
                    }}
                    className={`nav-item w-full ${view === item.id ? "active" : ""}`}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                <button
                  onClick={toggleDark}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-95"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? "Light" : "Dark"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
