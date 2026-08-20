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

const TABS: { label: string; value: TabValue }[] = [
	{ label: "Temporadas", value: "seasons" },
	{ label: "Partidos", value: "matches" },
	{ label: "Jugadores", value: "players" },
	{ label: "Nueva Jornada", value: "newMatch" },
	{ label: "Generador de Equipos", value: "generator" },
];

export function TabNav({ activeTab, onChange }: TabNavProps) {
	return (
		<nav className="flex gap-4 mb-8 overflow-x-auto border-b border-gray-300">
			{TABS.map((tab) => (
				<button
					type="button"
					key={tab.value}
					onClick={() => onChange(tab.value)}
					className={`relative px-4 py-2 font-semibold text-lg text-ellipsis whitespace-nowrap rounded-md ${
						activeTab === tab.value
							? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-emerald-600"
							: "text-gray-500 hover:text-emerald-600"
					}`}
					aria-current={activeTab === tab.value ? "page" : undefined}
				>
					{tab.label}
				</button>
			))}
		</nav>
	);
}
