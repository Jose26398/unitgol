import { Camera, Shield, Target, User, Wind, Zap } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
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
	return (
		<div
			className="relative flex items-center justify-center group"
			title="Balón de juego"
		>
			{/* Sombra realista en el césped */}
			<div className="absolute -bottom-1.5 w-8 sm:w-10 h-2.5 sm:h-3 rounded-full bg-black/45 blur-xs transition-transform duration-300 group-hover:scale-90" />

			{/* Balón de fútbol clásico perfectamente centrado */}
			<svg
				viewBox="0 0 100 100"
				className={`${className} relative z-10 transition-transform duration-500 ease-out group-hover:rotate-45 group-hover:-translate-y-1 drop-shadow-md select-none`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-label="Balón de fútbol"
			>
				<defs>
					<radialGradient id="pitchBall3d" cx="36%" cy="32%" r="65%">
						<stop offset="0%" stopColor="#ffffff" />
						<stop offset="65%" stopColor="#f8fafc" />
						<stop offset="100%" stopColor="#cbd5e1" />
					</radialGradient>
					<clipPath id="pitchBallClip">
						<circle cx="50" cy="50" r="44" />
					</clipPath>
				</defs>

				{/* Esfera base del balón */}
				<circle
					cx="50"
					cy="50"
					r="44"
					fill="url(#pitchBall3d)"
					stroke="#0f172a"
					strokeWidth="2.5"
				/>

				{/* Parches y costuras recortados a la esfera */}
				<g clipPath="url(#pitchBallClip)">
					{/* Parches oscuros del perímetro */}
					<polygon points="38,-2 62,-2 50,15" fill="#0f172a" />
					<polygon points="98,24 102,48 83,40" fill="#0f172a" />
					<polygon points="88,96 64,98 73,76" fill="#0f172a" />
					<polygon points="12,96 36,98 27,76" fill="#0f172a" />
					<polygon points="2,24 -2,48 17,40" fill="#0f172a" />

					{/* Pentágono central */}
					<polygon
						points="50,35 64.3,45.4 58.8,62.1 41.2,62.1 35.7,45.4"
						fill="#0f172a"
					/>

					{/* Costuras entre pentágono central y bordes */}
					<g
						stroke="#0f172a"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="50" y1="35" x2="50" y2="15" />
						<line x1="64.3" y1="45.4" x2="83" y2="40" />
						<line x1="58.8" y1="62.1" x2="73" y2="76" />
						<line x1="41.2" y1="62.1" x2="27" y2="76" />
						<line x1="35.7" y1="45.4" x2="17" y2="40" />
					</g>
				</g>
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

	// VISTA COMPACTA MÓVIL: Tarjetas más pequeñas, sin chip de posición y sin Eq. A/Eq. B
	if (size === "compact") {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`group relative flex flex-col w-[58px] min-[380px]:w-[64px] min-[420px]:w-[68px] rounded-lg overflow-hidden border-2 ${teamBorder} bg-slate-950 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-left select-none shrink-0`}
				title={`${player.name} (${slotLabel}) - ${
					ratingMode === "elo" ? "ELO" : "Puntos"
				}: ${score.toFixed(1)}`}
			>
				{/* Foto limpia compacta */}
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

				{/* Pie compacto: Solo Nombre y Puntuación (Sin chip de posición y sin distintivo Eq. A / Eq. B) */}
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

	const cardWidth = "w-[88px] sm:w-[98px]";
	const photoHeight = "h-[82px] sm:h-[94px]";

	return (
		<button
			type="button"
			onClick={onClick}
			className={`group relative flex flex-col ${cardWidth} rounded-xl overflow-hidden border-2 ${teamBorder} bg-slate-950 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer text-left select-none shrink-0`}
			title={`${player.name} (${slotLabel}) - ${
				ratingMode === "elo" ? "ELO" : "Puntos"
			}: ${score.toFixed(1)}`}
		>
			{/* FOTO 100% LIMPIA DEL JUGADOR */}
			<div
				className={`relative w-full ${photoHeight} overflow-hidden bg-slate-900`}
			>
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

			{/* BARRA INTERMEDIA ADHERIDA: Posición a la izquierda y Puntuación a la derecha */}
			<div className="flex items-center justify-between w-full px-1.5 py-1 bg-slate-900/95 border-t border-white/10 gap-0.5">
				{/* Chip Posición Completo */}
				<span
					className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${posInfo.badgeBg} text-white shadow-xs truncate`}
				>
					<PosIcon className="w-2.5 h-2.5 shrink-0" />
					<span className="truncate">{posInfo.label}</span>
				</span>

				{/* Puntuación / ELO */}
				<span className="text-[9px] sm:text-[10px] font-mono font-black text-amber-300 shrink-0">
					{Math.round(score)}
				</span>
			</div>

			{/* PIE DE LA TARJETA: Nombre del jugador y distintivo de equipo */}
			<div className="flex flex-col justify-center items-center w-full px-1 py-1 bg-slate-950 text-center border-t border-white/5">
				<span className="w-full text-[10px] sm:text-[11px] font-black truncate text-white leading-tight tracking-tight">
					{player.name}
				</span>
				<div className="flex items-center gap-1 mt-0.5">
					<span
						className={`w-1.5 h-1.5 rounded-full ${
							teamColor === "A" ? "bg-sky-400" : "bg-amber-400"
						}`}
					/>
					<span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
						{teamColor === "A" ? "Eq. A" : "Eq. B"}
					</span>
				</div>
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

	// Generar formaciones tácticas para ambos equipos
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
				// Descargar imagen directamente y copiar texto al portapapeles
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

	return (
		<div className="w-full space-y-4">
			{/* Cabecera de Equipos y Controles */}
			<div className="flex flex-row items-center justify-between gap-2 bg-slate-900 text-white p-3 sm:p-4 rounded-xl shadow-md border border-slate-800">
				{/* Equipo A */}
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

				{/* Botón de Captura */}
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

				{/* Equipo B */}
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

			{/* ================= VISTA MÓVIL: CAMPO ENCAJADO EN VERTICAL COMPACTO ================= */}
			<div className="block md:hidden w-full">
				<div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border-4 border-emerald-950 bg-emerald-800 shadow-xl p-1.5 select-none">
					{/* Césped a rayas horizontales */}
					<div
						className="absolute inset-0 pointer-events-none opacity-40"
						style={{
							backgroundImage:
								"repeating-linear-gradient(180deg, #15803d 0px, #15803d 28px, #166534 28px, #166534 56px)",
						}}
					/>

					{/* Líneas blancas del campo vertical compactas */}
					<div className="absolute inset-1.5 border-2 border-white/60 pointer-events-none rounded-md">
						{/* Portería superior (Equipo A) */}
						<div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-1.5 border-2 border-white/80 bg-white/20" />
						{/* Área de penalti superior */}
						<div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-12 border-b-2 border-x-2 border-white/60 rounded-b-sm" />
						<div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 border-b-2 border-x-2 border-white/60" />

						{/* Línea horizontal de medio campo */}
						<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 -translate-y-1/2" />
						{/* Círculo central */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/60 rounded-full" />

						{/* Área de penalti inferior (Equipo B) */}
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-12 border-t-2 border-x-2 border-white/60 rounded-t-sm" />
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 border-t-2 border-x-2 border-white/60" />
						{/* Portería inferior */}
						<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1.5 border-2 border-white/80 bg-white/20" />
					</div>

					{/* CONTENIDO INTERACTIVO VERTICAL (COMPACTO Y MENOS LARGO) */}
					<div className="relative z-10 flex flex-col justify-between py-1 space-y-2">
						{/* ================= MITAD SUPERIOR: EQUIPO A ================= */}
						<div className="flex flex-col space-y-1.5">
							{/* Fila 1: Portero Equipo A */}
							<div className="flex justify-center items-center">
								<PitchPlayerCard
									assigned={formationA.portero}
									teamColor="A"
									ratingMode={ratingMode}
									size="compact"
									onClick={() => onPlayerClick?.(formationA.portero.player)}
								/>
							</div>

							{/* Fila 2: Defensas Equipo A (2) */}
							<div className="flex justify-around items-center px-4">
								{formationA.defensas[0] && (
									<PitchPlayerCard
										assigned={formationA.defensas[0]}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() =>
											onPlayerClick?.(formationA.defensas[0].player)
										}
									/>
								)}
								{formationA.defensas[1] && (
									<PitchPlayerCard
										assigned={formationA.defensas[1]}
										teamColor="A"
										ratingMode={ratingMode}
										size="compact"
										onClick={() =>
											onPlayerClick?.(formationA.defensas[1].player)
										}
									/>
								)}
							</div>

							{/* Fila 3: Bandas y Medio Equipo A (3: Banda Izq, Medio Centro, Banda Dch) */}
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

							{/* Fila 4: Estaca Equipo A (1 encarando la línea central) */}
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

						{/* ================= MEDIO CAMPO: BALÓN CENTRADO ================= */}
						<div className="flex items-center justify-center py-1 z-20">
							<SoccerBall className="w-7 h-7" />
						</div>

						{/* ================= MITAD INFERIOR: EQUIPO B ================= */}
						<div className="flex flex-col space-y-1.5">
							{/* Fila 5: Estaca Equipo B (1 encarando la línea central) */}
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

							{/* Fila 6: Bandas y Medio Equipo B (3: Banda Izq, Medio Centro, Banda Dch) */}
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

							{/* Fila 7: Defensas Equipo B (2) */}
							<div className="flex justify-around items-center px-4">
								{formationB.defensas[0] && (
									<PitchPlayerCard
										assigned={formationB.defensas[0]}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() =>
											onPlayerClick?.(formationB.defensas[0].player)
										}
									/>
								)}
								{formationB.defensas[1] && (
									<PitchPlayerCard
										assigned={formationB.defensas[1]}
										teamColor="B"
										ratingMode={ratingMode}
										size="compact"
										onClick={() =>
											onPlayerClick?.(formationB.defensas[1].player)
										}
									/>
								)}
							</div>

							{/* Fila 8: Portero Equipo B */}
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

			{/* ================= VISTA ESCRITORIO: CAMPO HORIZONTAL AMPLIO ================= */}
			<div className="hidden md:block w-full overflow-x-auto pb-4">
				<div className="relative mx-auto w-full min-w-[1020px] overflow-hidden rounded-3xl border-4 border-emerald-950 bg-emerald-800 shadow-2xl p-4 sm:p-8 select-none">
					{/* Césped a rayas verticales (Striped Turf Texture horizontal) */}
					<div
						className="absolute inset-0 pointer-events-none opacity-40"
						style={{
							backgroundImage:
								"repeating-linear-gradient(90deg, #15803d 0px, #15803d 50px, #166534 50px, #166534 100px)",
						}}
					/>

					{/* Líneas blancas del campo horizontal amplio */}
					<div className="absolute inset-3 sm:inset-5 border-2 border-white/60 pointer-events-none rounded-md">
						{/* Portería izquierda (Equipo A) */}
						<div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-24 border-2 border-white/80 bg-white/20" />
						{/* Área de penalti izquierda */}
						<div className="absolute left-0 top-1/2 -translate-y-1/2 w-36 sm:w-44 h-72 sm:h-88 border-r-2 border-y-2 border-white/60 rounded-r-md" />
						<div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 sm:w-20 h-40 border-r-2 border-y-2 border-white/60" />

						{/* Línea vertical de medio campo */}
						<div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60 -translate-x-1/2" />
						{/* Círculo central */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-36 sm:h-44 border-2 border-white/60 rounded-full" />
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white/90 rounded-full" />

						{/* Área de penalti derecha (Equipo B) */}
						<div className="absolute right-0 top-1/2 -translate-y-1/2 w-36 sm:w-44 h-72 sm:h-88 border-l-2 border-y-2 border-white/60 rounded-l-md" />
						<div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 sm:w-20 h-40 border-l-2 border-y-2 border-white/60" />
						{/* Portería derecha */}
						<div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-24 border-2 border-white/80 bg-white/20" />
					</div>

					{/* CONTENIDO INTERACTIVO DEL CAMPO CON ALTURA AMPLIADA */}
					<div className="relative z-10 flex flex-row items-center justify-between min-h-[620px] sm:min-h-[680px] px-3 sm:px-8">
						{/* ================= MITAD IZQUIERDA: EQUIPO A ================= */}
						<div className="flex flex-row items-center justify-between flex-1 pr-6 sm:pr-12 h-full">
							{/* Col 1: Portero Equipo A */}
							<div className="flex flex-col justify-center items-center">
								<PitchPlayerCard
									assigned={formationA.portero}
									teamColor="A"
									ratingMode={ratingMode}
									onClick={() => onPlayerClick?.(formationA.portero.player)}
								/>
							</div>

							{/* Col 2: Defensas Equipo A (Arriba y Abajo con gran separación) */}
							<div className="flex flex-col justify-around items-center h-[520px] sm:h-[580px]">
								{formationA.defensas[0] && (
									<PitchPlayerCard
										assigned={formationA.defensas[0]}
										teamColor="A"
										ratingMode={ratingMode}
										onClick={() =>
											onPlayerClick?.(formationA.defensas[0].player)
										}
									/>
								)}
								{formationA.defensas[1] && (
									<PitchPlayerCard
										assigned={formationA.defensas[1]}
										teamColor="A"
										ratingMode={ratingMode}
										onClick={() =>
											onPlayerClick?.(formationA.defensas[1].player)
										}
									/>
								)}
							</div>

							{/* Col 3: Bandas y Medio Equipo A (Banda Arriba, Medio Centro, Banda Abajo) */}
							<div className="flex flex-col justify-between items-center h-[580px] sm:h-[640px]">
								{/* Banda Arriba */}
								{formationA.bandas[0] ? (
									<PitchPlayerCard
										assigned={formationA.bandas[0]}
										teamColor="A"
										ratingMode={ratingMode}
										onClick={() => onPlayerClick?.(formationA.bandas[0].player)}
									/>
								) : (
									<div className="w-[88px] sm:w-[98px]" />
								)}

								{/* Medios Centros */}
								<div className="flex flex-col gap-3">
									{formationA.medios.map((assigned) => (
										<PitchPlayerCard
											key={assigned.player.id}
											assigned={assigned}
											teamColor="A"
											ratingMode={ratingMode}
											onClick={() => onPlayerClick?.(assigned.player)}
										/>
									))}
								</div>

								{/* Banda Abajo */}
								{formationA.bandas[1] ? (
									<PitchPlayerCard
										assigned={formationA.bandas[1]}
										teamColor="A"
										ratingMode={ratingMode}
										onClick={() => onPlayerClick?.(formationA.bandas[1].player)}
									/>
								) : (
									<div className="w-[88px] sm:w-[98px]" />
								)}
							</div>

							{/* Col 4: Estaca Equipo A (Encarando al centro) */}
							<div className="flex flex-col justify-center items-center">
								{formationA.estacas.map((assigned) => (
									<PitchPlayerCard
										key={assigned.player.id}
										assigned={assigned}
										teamColor="A"
										ratingMode={ratingMode}
										onClick={() => onPlayerClick?.(assigned.player)}
									/>
								))}
							</div>
						</div>

						{/* ================= MEDIO CAMPO / BALÓN CENTRADO ================= */}
						<div className="flex flex-col items-center justify-center px-2 sm:px-3 z-20">
							<SoccerBall className="w-10 h-10 sm:w-12 sm:h-12" />
						</div>

						{/* ================= MITAD DERECHA: EQUIPO B ================= */}
						<div className="flex flex-row items-center justify-between flex-1 pl-6 sm:pr-4 h-full">
							{/* Col 5: Estaca Equipo B (Encarando al centro) */}
							<div className="flex flex-col justify-center items-center">
								{formationB.estacas.map((assigned) => (
									<PitchPlayerCard
										key={assigned.player.id}
										assigned={assigned}
										teamColor="B"
										ratingMode={ratingMode}
										onClick={() => onPlayerClick?.(assigned.player)}
									/>
								))}
							</div>

							{/* Col 6: Bandas y Medio Equipo B (Banda Arriba, Medio Centro, Banda Abajo) */}
							<div className="flex flex-col justify-between items-center h-[580px] sm:h-[640px]">
								{/* Banda Arriba */}
								{formationB.bandas[0] ? (
									<PitchPlayerCard
										assigned={formationB.bandas[0]}
										teamColor="B"
										ratingMode={ratingMode}
										onClick={() => onPlayerClick?.(formationB.bandas[0].player)}
									/>
								) : (
									<div className="w-[88px] sm:w-[98px]" />
								)}

								{/* Medios Centros */}
								<div className="flex flex-col gap-3">
									{formationB.medios.map((assigned) => (
										<PitchPlayerCard
											key={assigned.player.id}
											assigned={assigned}
											teamColor="B"
											ratingMode={ratingMode}
											onClick={() => onPlayerClick?.(assigned.player)}
										/>
									))}
								</div>

								{/* Banda Abajo */}
								{formationB.bandas[1] ? (
									<PitchPlayerCard
										assigned={formationB.bandas[1]}
										teamColor="B"
										ratingMode={ratingMode}
										onClick={() => onPlayerClick?.(formationB.bandas[1].player)}
									/>
								) : (
									<div className="w-[88px] sm:w-[98px]" />
								)}
							</div>

							{/* Col 7: Defensas Equipo B (Arriba y Abajo con gran separación) */}
							<div className="flex flex-col justify-around items-center h-[520px] sm:h-[580px]">
								{formationB.defensas[0] && (
									<PitchPlayerCard
										assigned={formationB.defensas[0]}
										teamColor="B"
										ratingMode={ratingMode}
										onClick={() =>
											onPlayerClick?.(formationB.defensas[0].player)
										}
									/>
								)}
								{formationB.defensas[1] && (
									<PitchPlayerCard
										assigned={formationB.defensas[1]}
										teamColor="B"
										ratingMode={ratingMode}
										onClick={() =>
											onPlayerClick?.(formationB.defensas[1].player)
										}
									/>
								)}
							</div>

							{/* Col 8: Portero Equipo B */}
							<div className="flex flex-col justify-center items-center">
								<PitchPlayerCard
									assigned={formationB.portero}
									teamColor="B"
									ratingMode={ratingMode}
									onClick={() => onPlayerClick?.(formationB.portero.player)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
