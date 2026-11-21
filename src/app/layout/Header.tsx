import { LogOut, Settings } from "lucide-react";

interface HeaderProps {
  teamName: string;
  isAdmin: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function Header({
  teamName,
  isAdmin,
  onOpenSettings,
  onLogout,
}: HeaderProps) {
  return (
    <header className="bg-emerald-600 bg-linear-to-br from-emerald-600 via-emerald-700 to-slate-600 text-white p-4 shadow-md shadow-emerald-950/10">
      <div className="container mx-auto flex items-center gap-3 px-4">
        <img src="/favicon.png" className="w-8 h-8 shrink-0" alt="Logo" />
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
          <h1 className="text-2xl font-bold sm:flex-1">UnitGol</h1>
          <span className="block truncate text-sm text-gray-100">
            {teamName} {isAdmin ? "(Admin)" : ""}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            className="group bg-white/10 text-white p-2 rounded-md hover:bg-white/20 focus-visible:outline-white"
            onClick={onOpenSettings}
            aria-label="Abrir configuración"
          >
            <Settings className="w-6 h-6 transition-transform duration-300 motion-safe:group-hover:rotate-45" />
          </button>
          <button
            type="button"
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus-visible:outline-white"
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
