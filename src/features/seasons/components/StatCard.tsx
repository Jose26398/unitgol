import { BarChart2 } from "lucide-react";

export function Header({ title }: { title: string }) {
	return (
		<h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
			<BarChart2 className="w-7 h-7 text-emerald-500" /> {title}
		</h3>
	);
}

interface StatsSectionProps {
	title: string;
	icon: React.ReactNode;
	titleClass?: string;
	stats: Array<{
		icon: React.ReactNode;
		label: string;
		value: React.ReactNode;
		onValueClick?: () => void;
		highlight?: boolean;
	}>;
}

export function StatsSection({
	title,
	icon,
	titleClass = "",
	stats,
}: StatsSectionProps) {
	return (
		<div className="mb-8">
			<h4
				className={`text-lg font-semibold mb-3 flex items-center gap-2 ${titleClass}`}
			>
				{icon} {title}
			</h4>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
				{stats.map((stat) => (
					<StatCard key={stat.label} {...stat} />
				))}
			</div>
		</div>
	);
}

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	onValueClick?: () => void;
	highlight?: boolean;
}

export function StatCard({
	icon,
	label,
	value,
	onValueClick,
	highlight,
}: StatCardProps) {
	return (
		<button
			type="button"
			className={`flex items-center gap-4 p-4 rounded-xl shadow-xs bg-white border hover:bg-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer text-left w-full
        ${onValueClick ? "underline decoration-dotted" : ""} transition-all duration-200
        ${highlight ? "border-emerald-400 bg-emerald-50/60" : "border-gray-100"}`}
			title={label}
			onClick={onValueClick}
		>
			<div className="shrink-0">{icon}</div>
			<div>
				<div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
				<div className="text-lg font-bold text-gray-800 cursor-pointer">
					{value}
				</div>
			</div>
		</button>
	);
}
