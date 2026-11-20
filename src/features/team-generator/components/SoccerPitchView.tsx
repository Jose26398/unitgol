import { Camera, Shield, Target, User, Wind, Zap } from "lucide-react";
import type React from "react";
import { useId, useMemo, useState } from "react";
import { getPlayerAvatarUrl } from "@/features/players/utils/playerAvatar";
import type { Player, PlayerPosition } from "@/types";
import { type EloRatings, getEloRating, type RatingMode } from "@/utils/elo";
import { calculateScore } from "@/utils/playerStats";
import { createPitchImage } from "../utils/pitchImage";
import {
	type AssignedPlayer,
	assignTacticalPositions,
	type TeamTacticalFormation,
} from "../utils/tacticalPositions";

interface SoccerPitchViewProps {
	teamAPlayers: Player[];
	teamBPlayers: Player[];
	allPlayers?: Player[];
	matches?: unknown[];
	seasonId: string | null;
	ratingMode: RatingMode;
	eloRatings?: EloRatings | null;
	onPlayerClick?: (player: Player) => void;
}

const POSITION_COLOR_MAP: Record<
	PlayerPosition | "portero",
	{
		badgeBg: string;
		border: string;
		text: string;
		label: string;
		icon: React.ComponentType<{ className?: string }>;
	}
> = {
	portero: {
		badgeBg: "bg-emerald-500",
		border: "border-emerald-400",
		text: "text-white",
		label: "Portero",
		icon: Shield,
	},
	defensa: {
		badgeBg: "bg-blue-600",
		border: "border-blue-400",
		text: "text-white",
		label: "Defensa",
		icon: Shield,
	},
	banda: {
		badgeBg: "bg-amber-500",
		border: "border-amber-400",
		text: "text-white",
		label: "Banda",
		icon: Wind,
	},
	medio: {
		badgeBg: "bg-purple-600",
		border: "border-purple-400",
		text: "text-white",
		label: "Medio",
		icon: Zap,
	},
	estaca: {
		badgeBg: "bg-rose-600",
		border: "border-rose-400",
		text: "text-white",
		label: "Estaca",
		icon: Target,
	},
};

function SoccerBall({
	className = "w-10 h-10 sm:w-12 sm:h-12",
}: {
	className?: string;
}) {
	const uid = useId();
	const gradId = `${uid}-ball-3d`;
	const panelId = `${uid}-ball-panel`;
	const clipId = `${uid}-ball-clip`;

	return (
		<div
			className="relative flex items-center justify-center group"
			title="Balón de juego"
		>
			<div className="absolute -bottom-1.5 w-8 sm:w-10 h-2.5 sm:h-3 rounded-full bg-black/50 blur-xs transition-transform duration-300 group-hover:scale-90" />
			<svg
				viewBox="0 0 100 100"
				className={`${className} relative z-10 transition-transform duration-500 ease-out group-hover:rotate-45 group-hover:-translate-y-1 drop-shadow-lg select-none`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-label="Balón de fútbol"
			>
				<defs>
					<radialGradient id={gradId} cx="35%" cy="30%" r="70%">
						<stop offset="0%" stopColor="#ffffff" />
						<stop offset="55%" stopColor="#f1f5f9" />
						<stop offset="85%" stopColor="#cbd5e1" />
						<stop offset="100%" stopColor="#64748b" />
					</radialGradient>
					<radialGradient id={panelId} cx="35%" cy="30%" r="75%">
						<stop offset="0%" stopColor="#334155" />
						<stop offset="100%" stopColor="#0f172a" />
					</radialGradient>
					<clipPath id={clipId}>
						<circle cx="50" cy="50" r="45" />
					</clipPath>
				</defs>

				{/* Esfera 3D */}
				<circle cx="50" cy="50" r="45" fill={`url(#${gradId})`} />

				{/* Paneles y costuras */}
				<g clipPath={`url(#${clipId})`}>
					{/* Costuras hacia los paneles exteriores */}
					<g
						stroke="#334155"
						strokeWidth="2.2"
						strokeLinecap="round"
						opacity="0.85"
					>
						<line x1="50" y1="36" x2="50" y2="14" />
						<line x1="63.3" y1="45.7" x2="84.2" y2="38.9" />
						<line x1="58.2" y1="61.3" x2="71.1" y2="79.1" />
						<line x1="41.8" y1="61.3" x2="28.9" y2="79.1" />
						<line x1="36.7" y1="45.7" x2="15.8" y2="38.9" />
					</g>

					{/* Costuras secundarias del perímetro */}
					<g
						stroke="#475569"
						strokeWidth="1.6"
						strokeLinecap="round"
						opacity="0.65"
					>
						<line x1="50" y1="14" x2="31" y2="5" />
						<line x1="50" y1="14" x2="69" y2="5" />
						<line x1="84.2" y1="38.9" x2="94" y2="23" />
						<line x1="84.2" y1="38.9" x2="95" y2="57" />
						<line x1="71.1" y1="79.1" x2="88" y2="82" />
						<line x1="71.1" y1="79.1" x2="59" y2="95" />
						<line x1="28.9" y1="79.1" x2="41" y2="95" />
						<line x1="28.9" y1="79.1" x2="12" y2="82" />
						<line x1="15.8" y1="38.9" x2="5" y2="57" />
						<line x1="15.8" y1="38.9" x2="6" y2="23" />
					</g>

					{/* Pentágono central */}
					<polygon
						points="50,36 63.3,45.7 58.2,61.3 41.8,61.3 36.7,45.7"
						fill={`url(#${panelId})`}
					/>

					{/* 5 paneles pentagonales exteriores */}
					<polygon
						points="50,15 62,7 58,-4 42,-4 38,7"
						fill={`url(#${panelId})`}
					/>
					<polygon
						points="83.5,39 95,46 104,35 97,22 84,26"
						fill={`url(#${panelId})`}
					/>
					<polygon
						points="71,78.5 72,92 86,94 92,81 82,71"
						fill={`url(#${panelId})`}
					/>
					<polygon
						points="29,78.5 18,71 8,81 14,94 28,92"
						fill={`url(#${panelId})`}
					/>
					<polygon
						points="16.5,39 16,26 3,22 -4,35 5,46"
						fill={`url(#${panelId})`}
					/>

					{/* Brillo especular sutil */}
					<ellipse
						cx="36"
						cy="28"
						rx="14"
						ry="8"
						transform="rotate(-30 36 28)"
						fill="#ffffff"
						opacity="0.35"
					/>
				</g>

				{/* Borde nítido */}
				<circle cx="50" cy="50" r="45" stroke="#0f172a" strokeWidth="2.2" />
			</svg>
		</div>
	);
}

function PitchPlayerCard({
	assigned,
	teamColor = "A",
	ratingMode,
	size = "normal",
	onClick,
}: {
	assigned: AssignedPlayer;
	teamColor: "A" | "B";
	ratingMode: RatingMode;
	size?: "compact" | "normal";
	onClick?: () => void;
}) {
	const { player, tacticalPosition, score, slotLabel } = assigned;
	const posInfo = POSITION_COLOR_MAP[tacticalPosition];
	const PosIcon = posInfo.icon;

	const teamBorder =
		teamColor === "A"
			? "border-sky-400/90 shadow-sky-500/20 hover:border-sky-300 hover:shadow-sky-400/50"
			: "border-amber-400/90 shadow-amber-500/20 hover:border-amber-300 hover:shadow-amber-400/50";

	if (size === "compact") {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`group relative flex flex-col w-[58px] min-[380px]:w-[64px] min-[420px]:w-[68px] rounded-lg overflow-hidden border-2 ${teamBorder} bg-slate-950 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-left select-none shrink-0`}
				title={`${player.name} (${slotLabel}) - ${
					ratingMode === "elo" ? "ELO" : "Puntos"
				}: ${score.toFixed(1)} | ${player.goals}G ${player.assists}A`}
			>
				<div className="relative w-full h-[46px] min-[380px]:h-[52px] overflow-hidden bg-slate-900">
					{player.avatarPath ? (
						<img
							src={getPlayerAvatarUrl(player.avatarPath)}
							alt={player.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-linear-to-b from-slate-800 to-slate-950 text-slate-400">
							<User className="w-5 h-5" />
						</div>
					)}
				</div>
				<div className="flex flex-col items-center justify-center w-full px-0.5 py-0.5 bg-slate-950 text-center border-t border-white/5">
					<span className="w-full text-[8px] min-[380px]:text-[8.5px] font-black truncate text-white leading-tight">
						{player.name}
					</span>
					<span className="text-[7.5px] min-[380px]:text-[8px] font-mono font-bold text-amber-300 leading-tight">
						{Math.round(score)}
					</span>
				</div>
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={`group relative flex flex-col w-[88px] sm:w-[98px] rounded-xl overflow-hidden border-2 ${teamBorder} bg-slate-950 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer text-left select-none shrink-0`}
			title={`${player.name} (${slotLabel}) - ${
				ratingMode === "elo" ? "ELO" : "Puntos"
			}: ${score.toFixed(1)} | ${player.goals}G ${player.assists}A`}
		>
			<div className="relative w-full h-[82px] sm:h-[94px] overflow-hidden bg-slate-900">
				{player.avatarPath ? (
					<img
						src={getPlayerAvatarUrl(player.avatarPath)}
						alt={player.name}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-linear-to-b from-slate-800 to-slate-950 text-slate-400">
						<User className="w-10 h-10" />
					</div>
				)}
			</div>

			<div className="flex items-center justify-between w-full px-1.5 py-1 bg-slate-900/95 border-t border-white/10 gap-0.5">
				<span
					className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${posInfo.badgeBg} text-white shadow-xs truncate`}
				>
					<PosIcon className="w-2.5 h-2.5 shrink-0" />
					<span className="truncate">{posInfo.label}</span>
				</span>
				<span className="text-[9px] sm:text-[10px] font-mono font-black text-amber-300 shrink-0">
					{Math.round(score)}
				</span>
			</div>

			<div className="flex flex-col justify-center items-center w-full px-1 py-1 bg-slate-950 text-center border-t border-white/5">
				<span className="w-full text-[10px] sm:text-[11px] font-black truncate text-white leading-tight tracking-tight">
					{player.name}
				</span>
				<span className="text-[8px] font-mono text-slate-400 mt-0.5">
					{player.goals}G · {player.assists}A
				</span>
			</div>
		</button>
	);
}

export function SoccerPitchView({
	teamAPlayers,
	teamBPlayers,
	ratingMode,
	eloRatings,
	onPlayerClick,
}: SoccerPitchViewProps) {
	const [sharingStatus, setSharingStatus] = useState<string | null>(null);
	const [isGeneratingImage, setIsGeneratingImage] = useState(false);

	const getPlayerValue = useMemo(() => {
		return (player: Player) =>
			ratingMode === "elo"
				? getEloRating(eloRatings ?? null, player.id)
				: calculateScore(player);
	}, [ratingMode, eloRatings]);

	const formationA: TeamTacticalFormation = useMemo(() => {
		return assignTacticalPositions(teamAPlayers, getPlayerValue, "Equipo A");
	}, [teamAPlayers, getPlayerValue]);

	const formationB: TeamTacticalFormation = useMemo(() => {
		return assignTacticalPositions(teamBPlayers, getPlayerValue, "Equipo B");
	}, [teamBPlayers, getPlayerValue]);

	const handleSharePitchImage = async () => {
		setIsGeneratingImage(true);
		setSharingStatus(null);
		try {
			const imageFile = await createPitchImage(
				formationA,
				formationB,
				ratingMode,
			);

			const shareText = `⚽ UNITGOL · ALINEACIÓN FÚTBOL 7\n\n🔵 Equipo A (${
				ratingMode === "elo" ? "ELO" : "PTS"
			}: ${formationA.score.toFixed(1)})\n🟡 Equipo B (${
				ratingMode === "elo" ? "ELO" : "PTS"
			}: ${formationB.score.toFixed(1)})`;

			if (navigator.canShare?.({ files: [imageFile] }) && navigator.share) {
				await navigator.share({
					title: "Alineación Táctica UnitGol",
					text: shareText,
					files: [imageFile],
				});
				setSharingStatus("Alineación compartida con éxito.");
			} else {
				const url = URL.createObjectURL(imageFile);
				const link = document.createElement("a");
				link.href = url;
				link.download = "unitgol-alineacion-campo.png";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				if (navigator.clipboard) {
					await navigator.clipboard.writeText(shareText);
				}
				setSharingStatus(
					"Captura del campo descargada y datos copiados al portapapeles.",
				);
			}
		} catch (err) {
			console.error("Error al capturar el campo:", err);
			setSharingStatus("No se pudo generar la imagen del campo.");
		} finally {
			setIsGeneratingImage(false);
		}
	};

	const renderDesktopTeamHalf = (
		formation: TeamTacticalFormation,
		teamColor: "A" | "B",
	) => {
		const isTeamA = teamColor === "A";
		const midLane: AssignedPlayer[] = [
			...(formation.bandas[0] ? [formation.bandas[0]] : []),
			...formation.medios,
			...(formation.bandas[1] ? [formation.bandas[1]] : []),
			...formation.bandas.slice(2),
		];

		const columns: { id: string; players: AssignedPlayer[] }[] = isTeamA
			? [
					{ id: "gk", players: [formation.portero] },
					{ id: "def", players: formation.defensas },
					{ id: "mid", players: midLane },
					{ id: "att", players: formation.estacas },
				]
			: [
					{ id: "att", players: formation.estacas },
					{ id: "mid", players: midLane },
					{ id: "def", players: formation.defensas },
					{ id: "gk", players: [formation.portero] },
				];

		return (
			<div className="flex-1 grid grid-cols-4 gap-2 items-center py-4 px-2">
				{columns.map((col) => (
					<div
						key={`${teamColor}-${col.id}`}
						className="flex flex-col items-center justify-around gap-3 h-full"
					>
						{col.players.map((assigned) => (
							<PitchPlayerCard
								key={assigned.player.id}
								assigned={assigned}
								teamColor={teamColor}
								ratingMode={ratingMode}
								onClick={() => onPlayerClick?.(assigned.player)}
							/>
						))}
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="w-full space-y-4">
			{/* Cabecera de Equipos y Controles */}
			<div className="flex flex-row items-center justify-between gap-2 bg-slate-900 text-white p-3 sm:p-4 rounded-xl shadow-md border border-slate-800">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-sky-400 ring-2 ring-sky-300 shrink-0" />
					<div>
						<h4 className="font-bold text-sm text-sky-400">Equipo A</h4>
						<p className="text-[11px] sm:text-xs text-slate-300 font-mono">
							{ratingMode === "elo" ? "ELO: " : "PTS: "}
							<span className="text-white font-bold">
								{formationA.score.toFixed(1)}
							</span>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleSharePitchImage}
						disabled={isGeneratingImage}
						className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg border border-emerald-500 shadow transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
						title="Descargar o compartir imagen de la distribución táctica (siempre horizontal)"
					>
						<Camera className="w-3.5 h-3.5 shrink-0" />
						<span className="truncate">
							{isGeneratingImage ? "Generando..." : "Captura del Campo"}
						</span>
					</button>
				</div>

				<div className="flex items-center gap-2 sm:gap-3 text-right">
					<div>
						<h4 className="font-bold text-sm text-amber-400">Equipo B</h4>
						<p className="text-[11px] sm:text-xs text-slate-300 font-mono">
							{ratingMode === "elo" ? "ELO: " : "PTS: "}
							<span className="text-white font-bold">
								{formationB.score.toFixed(1)}
							</span>
						</p>
					</div>
					<div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400 ring-2 ring-amber-300 shrink-0" />
				</div>
			</div>

			{sharingStatus && (
				<div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
					{sharingStatus}
				</div>
			)}

			{/* VISTA MÓVIL: CAMPO VERTICAL COMPACTO */}
			<div className="block md:hidden w-full">
				<div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border-4 border-emerald-950 bg-emerald-800 shadow-xl p-1.5 select-none">
					<div
						className="absolute inset-0 pointer-events-none opacity-40"
						style={{
							backgroundImage:
								"repeating-linear-gradient(180deg, #15803d 0px, #15803d 28px, #166534 28px, #166534 56px)",
						}}
					/>

					<div className="absolute inset-1.5 border-2 border-white/60 pointer-events-none rounded-md">
						<div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-1.5 border-2 border-white/80 bg-white/20" />
						<div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-12 border-b-2 border-x-2 border-white/60 rounded-b-sm" />
						<div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 border-b-2 border-x-2 border-white/60" />

						<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 -translate-y-1/2" />
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/60 rounded-full" />

						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-12 border-t-2 border-x-2 border-white/60 rounded-t-sm" />
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 border-t-2 border-x-2 border-white/60" />
						<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1.5 border-2 border-white/80 bg-white/20" />
					</div>

					<div className="relative z-10 flex flex-col justify-between py-1 space-y-2">
						{/* Equipo A */}
						<div className="flex flex-col space-y-1.5">
							<div className="flex justify-center items-center">
								<PitchPlayerCard
									assigned={formationA.portero}
									teamColor="A"
									ratingMode={ratingMode}
									size="compact"
									onClick={() => onPlayerClick?.(formationA.portero.player)}
								/>
							</div>
							<div className="flex justify-around items-center px-4">
								{formationA.defensas.map((assigned) => (
									<PitchPlayerCard
										key={assigned.player.id}
										assigned={assigned}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(assigned.player)}
									/>
								))}
							</div>
							<div className="flex justify-between items-center px-1">
								{formationA.bandas[0] ? (
									<PitchPlayerCard
										assigned={formationA.bandas[0]}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(formationA.bandas[0].player)}
									/>
								) : (
									<div className="w-[58px]" />
								)}
								{formationA.medios[0] ? (
									<PitchPlayerCard
										assigned={formationA.medios[0]}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(formationA.medios[0].player)}
									/>
								) : (
									<div className="w-[58px]" />
								)}
								{formationA.bandas[1] ? (
									<PitchPlayerCard
										assigned={formationA.bandas[1]}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(formationA.bandas[1].player)}
									/>
								) : (
									<div className="w-[58px]" />
								)}
							</div>
							<div className="flex justify-center items-center">
								{formationA.estacas.map((assigned) => (
									<PitchPlayerCard
										key={assigned.player.id}
										assigned={assigned}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(assigned.player)}
									/>
								))}
							</div>
						</div>

						<div className="flex items-center justify-center py-1 z-20">
							<SoccerBall className="w-7 h-7" />
						</div>

						{/* Equipo B */}
						<div className="flex flex-col space-y-1.5">
							<div className="flex justify-center items-center">
								{formationB.estacas.map((assigned) => (
									<PitchPlayerCard
										key={assigned.player.id}
										assigned={assigned}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(assigned.player)}
									/>
								))}
							</div>
							<div className="flex justify-between items-center px-1">
								{formationB.bandas[0] ? (
									<PitchPlayerCard
										assigned={formationB.bandas[0]}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(formationB.bandas[0].player)}
									/>
								) : (
									<div className="w-[58px]" />
								)}
								{formationB.medios[0] ? (
									<PitchPlayerCard
										assigned={formationB.medios[0]}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(formationB.medios[0].player)}
									/>
								) : (
									<div className="w-[58px]" />
								)}
								{formationB.bandas[1] ? (
									<PitchPlayerCard
										assigned={formationB.bandas[1]}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(formationB.bandas[1].player)}
									/>
								) : (
									<div className="w-[58px]" />
								)}
							</div>
							<div className="flex justify-around items-center px-4">
								{formationB.defensas.map((assigned) => (
									<PitchPlayerCard
										key={assigned.player.id}
										assigned={assigned}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() => onPlayerClick?.(assigned.player)}
									/>
								))}
							</div>
							<div className="flex justify-center items-center">
								<PitchPlayerCard
									assigned={formationB.portero}
									teamColor="B"
									ratingMode={ratingMode}
									size="compact"
									onClick={() => onPlayerClick?.(formationB.portero.player)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* VISTA ESCRITORIO: CAMPO HORIZONTAL */}
			<div className="hidden md:block w-full">
				<div className="relative w-full min-h-[480px] overflow-hidden rounded-2xl border-4 border-emerald-950 bg-emerald-800 shadow-xl p-3 select-none">
					<div
						className="absolute inset-0 pointer-events-none opacity-40"
						style={{
							backgroundImage:
								"repeating-linear-gradient(90deg, #15803d 0px, #15803d 48px, #166534 48px, #166534 96px)",
						}}
					/>

					<div className="absolute inset-3 border-2 border-white/60 pointer-events-none rounded-md">
						<div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-20 border-2 border-white/80 bg-white/20" />
						<div className="absolute top-1/2 left-0 -translate-y-1/2 w-24 h-56 border-r-2 border-y-2 border-white/60 rounded-r-sm" />

						<div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60 -translate-x-1/2" />
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/60 rounded-full" />

						<div className="absolute top-1/2 right-0 -translate-y-1/2 w-24 h-56 border-l-2 border-y-2 border-white/60 rounded-l-sm" />
						<div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-20 border-2 border-white/80 bg-white/20" />
					</div>

					<div className="relative z-10 flex items-stretch justify-between min-h-[456px]">
						{renderDesktopTeamHalf(formationA, "A")}
						<div className="flex items-center justify-center px-1 z-20">
							<SoccerBall className="w-10 h-10" />
						</div>
						{renderDesktopTeamHalf(formationB, "B")}
					</div>
				</div>
			</div>
		</div>
	);
}
