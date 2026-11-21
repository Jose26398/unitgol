import {
  Calendar,
  CalendarPlus,
  type LucideIcon,
  Shuffle,
  Trophy,
  Users,
} from "lucide-react";

export type TabValue =
  | "seasons"
  | "matches"
  | "players"
  | "newMatch"
  | "generator";

interface TabNavProps {
  activeTab: TabValue;
  onChange: (tab: TabValue) => void;
}

const TABS: { label: string; value: TabValue; icon: LucideIcon }[] = [
  { label: "Temporadas", value: "seasons", icon: Trophy },
  { label: "Partidos", value: "matches", icon: Calendar },
  { label: "Jugadores", value: "players", icon: Users },
  { label: "Nueva Jornada", value: "newMatch", icon: CalendarPlus },
  { label: "Generador de Equipos", value: "generator", icon: Shuffle },
];

export function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <nav className="flex gap-4 mb-8 overflow-x-auto border-b border-gray-300">
      {TABS.map((tab) => (
        <button
          type="button"
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative flex shrink-0 items-center gap-2 px-4 py-2 font-semibold text-lg text-ellipsis whitespace-nowrap rounded-t-md after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:rounded-full after:bg-emerald-600 after:transition-transform after:duration-200 ${
            activeTab === tab.value
              ? "text-emerald-600 bg-emerald-50 after:scale-x-100"
              : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/60 after:scale-x-0 hover:after:scale-x-50"
          }`}
          aria-current={activeTab === tab.value ? "page" : undefined}
        >
          <tab.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
