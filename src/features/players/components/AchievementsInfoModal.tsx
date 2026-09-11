import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "../utils/achievements";

interface AchievementsInfoModalProps {
	onClose: () => void;
}

export function AchievementsInfoModal({ onClose }: AchievementsInfoModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="achievements-info-title"
		>
			<div
				ref={modalRef}
				className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
			>
				<div className="mb-5 flex items-center justify-between">
					<h2
						id="achievements-info-title"
						className="text-xl font-bold text-emerald-600"
					>
						Logros disponibles
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-500 transition-colors hover:text-gray-800"
						aria-label="Cerrar explicación de logros"
						title="Cerrar"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="space-y-3">
					{ACHIEVEMENTS.map((achievement) => (
						<div
							key={achievement.id}
							className="flex items-start gap-3 rounded-md border border-gray-300 hover:bg-gray-100 p-3"
						>
							<span className="text-2xl" aria-hidden="true">
								{achievement.emoji}
							</span>
							<div>
								<h3 className="font-semibold text-gray-800">
									{achievement.name}
								</h3>
								<p className="text-sm text-gray-600">
									{achievement.description}
								</p>
							</div>
						</div>
					))}
				</div>
                <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-red-500 text-white px-4 py-2 rounded-sm hover:bg-red-600 transition-colors"
                            aria-label="Cerrar modal"
                        >
                            Cerrar
                        </button>
                </div>
			</div>
		</div>
	);
}
