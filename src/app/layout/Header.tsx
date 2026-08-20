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
		<header className="bg-emerald-600 text-white p-4 shadow-md">
			<div className="container mx-auto flex items-center gap-3 px-4">
				<img src="/favicon.ico" className="w-8 h-8" alt="Logo" />
				<h1 className="text-2xl font-bold flex-1">UnitGol</h1>
				<div className="flex items-center gap-4">
					<span className="text-gray-100">
						{teamName} {isAdmin ? "(Admin)" : ""}
					</span>
					<button
						type="button"
						className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700"
						onClick={onOpenSettings}
						aria-label="Abrir configuración"
					>
						<Settings className="w-6 h-6" />
					</button>
					<button
						type="button"
						className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
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
