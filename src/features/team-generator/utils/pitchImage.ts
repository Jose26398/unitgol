import type { RatingMode } from "@/utils/elo";
import type {
	AssignedPlayer,
	TeamTacticalFormation,
} from "./tacticalPositions";

const POSITION_COLORS: Record<
	string,
	{ bg: string; text: string; label: string }
> = {
	portero: { bg: "#10b981", text: "#ffffff", label: "Portero" },
	defensa: { bg: "#2563eb", text: "#ffffff", label: "Defensa" },
	banda: { bg: "#f59e0b", text: "#ffffff", label: "Banda" },
	medio: { bg: "#9333ea", text: "#ffffff", label: "Medio" },
	estaca: { bg: "#e11d48", text: "#ffffff", label: "Estaca" },
};

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function drawSoccerBall(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	r: number,
) {
	ctx.save();

	// Sombra en el césped
	ctx.beginPath();
	ctx.ellipse(cx, cy + r * 0.95, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
	ctx.fill();

	// Esfera con degradado 3D
	const grad = ctx.createRadialGradient(
		cx - r * 0.3,
		cy - r * 0.3,
		r * 0.1,
		cx,
		cy,
		r,
	);
	grad.addColorStop(0, "#ffffff");
	grad.addColorStop(0.6, "#f1f5f9");
	grad.addColorStop(1, "#94a3b8");

	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = grad;
	ctx.fill();

	ctx.clip();

	// Pentágono central
	const rp = r * 0.32;
	const pts: [number, number][] = [];
	for (let i = 0; i < 5; i++) {
		const angle = (-90 + i * 72) * (Math.PI / 180);
		pts.push([cx + rp * Math.cos(angle), cy + rp * Math.sin(angle)]);
	}

	ctx.strokeStyle = "#334155";
	ctx.lineWidth = 1.6;
	ctx.lineCap = "round";

	for (let i = 0; i < 5; i++) {
		const angle = (-90 + i * 72) * (Math.PI / 180);
		const midX = cx + r * 0.78 * Math.cos(angle);
		const midY = cy + r * 0.78 * Math.sin(angle);

		ctx.beginPath();
		ctx.moveTo(pts[i][0], pts[i][1]);
		ctx.lineTo(midX, midY);
		ctx.stroke();

		// Panel exterior en cada vértice
		const pCenterX = cx + r * 0.95 * Math.cos(angle);
		const pCenterY = cy + r * 0.95 * Math.sin(angle);
		ctx.beginPath();
		for (let j = 0; j < 5; j++) {
			const pa = angle + Math.PI + ((j - 2) * 72 * Math.PI) / 180;
			const px = pCenterX + r * 0.25 * Math.cos(pa);
			const py = pCenterY + r * 0.25 * Math.sin(pa);
			if (j === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.closePath();
		ctx.fillStyle = "#0f172a";
		ctx.fill();
	}

	// Relleno pentágono central
	ctx.beginPath();
	ctx.moveTo(pts[0][0], pts[0][1]);
	for (let i = 1; i < 5; i++) {
		ctx.lineTo(pts[i][0], pts[i][1]);
	}
	ctx.closePath();
	ctx.fillStyle = "#0f172a";
	ctx.fill();

	ctx.restore();

	// Borde nítido exterior
	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#0f172a";
	ctx.stroke();
	ctx.restore();
}

function drawPlayerCard(
	ctx: CanvasRenderingContext2D,
	assigned: AssignedPlayer,
	cx: number,
	cy: number,
	teamColor: "A" | "B",
) {
	const cardW = 112;
	const cardH = 74;
	const x = cx - cardW / 2;
	const y = cy - cardH / 2;
	const posInfo =
		POSITION_COLORS[assigned.tacticalPosition] ?? POSITION_COLORS.medio;

	ctx.save();
	drawRoundedRect(ctx, x, y, cardW, cardH, 10);
	ctx.fillStyle = "#0f172a";
	ctx.fill();
	ctx.lineWidth = 2.5;
	ctx.strokeStyle = teamColor === "A" ? "#38bdf8" : "#fbbf24";
	ctx.stroke();

	// Position badge
	drawRoundedRect(ctx, x + 6, y + 6, 62, 18, 5);
	ctx.fillStyle = posInfo.bg;
	ctx.fill();

	ctx.fillStyle = posInfo.text;
	ctx.font = "bold 10px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(posInfo.label, x + 37, y + 15);

	// Score
	ctx.fillStyle = "#fcd34d";
	ctx.font = "bold 11px monospace";
	ctx.textAlign = "right";
	ctx.fillText(String(Math.round(assigned.score)), x + cardW - 8, y + 15);

	// Player name
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 12px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const name =
		assigned.player.name.length > 13
			? `${assigned.player.name.slice(0, 12)}…`
			: assigned.player.name;
	ctx.fillText(name, cx, y + 43);

	// G/A summary
	ctx.fillStyle = "#94a3b8";
	ctx.font = "10px monospace";
	ctx.fillText(
		`${assigned.player.goals}G · ${assigned.player.assists}A`,
		cx,
		y + 60,
	);

	ctx.restore();
}

function drawTeamFormation(
	ctx: CanvasRenderingContext2D,
	formation: TeamTacticalFormation,
	teamColor: "A" | "B",
	pitchX: number,
	pitchY: number,
	pitchW: number,
	pitchH: number,
) {
	const isLeft = teamColor === "A";
	const halfW = pitchW / 2;
	const colX = (fractionFromGoal: number) =>
		isLeft
			? pitchX + halfW * fractionFromGoal
			: pitchX + pitchW - halfW * fractionFromGoal;

	// Portero
	drawPlayerCard(
		ctx,
		formation.portero,
		colX(0.14),
		pitchY + pitchH / 2,
		teamColor,
	);

	// Defensas
	const defCount = formation.defensas.length;
	formation.defensas.forEach((p, idx) => {
		const y =
			defCount === 1
				? pitchY + pitchH / 2
				: pitchY + (pitchH / (defCount + 1)) * (idx + 1);
		drawPlayerCard(ctx, p, colX(0.36), y, teamColor);
	});

	// Medios + Bandas
	const midLane: AssignedPlayer[] = [
		...(formation.bandas[0] ? [formation.bandas[0]] : []),
		...formation.medios,
		...(formation.bandas[1] ? [formation.bandas[1]] : []),
		...formation.bandas.slice(2),
	];
	midLane.forEach((p, idx) => {
		const y =
			midLane.length === 1
				? pitchY + pitchH / 2
				: pitchY + (pitchH / (midLane.length + 1)) * (idx + 1);
		drawPlayerCard(ctx, p, colX(0.62), y, teamColor);
	});

	// Estacas
	formation.estacas.forEach((p, idx) => {
		const y =
			formation.estacas.length === 1
				? pitchY + pitchH / 2
				: pitchY + (pitchH / (formation.estacas.length + 1)) * (idx + 1);
		drawPlayerCard(ctx, p, colX(0.84), y, teamColor);
	});
}

export async function createPitchImage(
	formationA: TeamTacticalFormation,
	formationB: TeamTacticalFormation,
	ratingMode: RatingMode,
): Promise<File> {
	const width = 1280;
	const height = 720;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("No se pudo inicializar el contexto del canvas.");
	}

	// Background
	ctx.fillStyle = "#064e3b";
	ctx.fillRect(0, 0, width, height);

	// Header
	ctx.fillStyle = "#0f172a";
	ctx.fillRect(0, 0, width, 64);

	const label = ratingMode === "elo" ? "ELO" : "PTS";
	ctx.font = "bold 20px sans-serif";
	ctx.textBaseline = "middle";

	ctx.fillStyle = "#38bdf8";
	ctx.textAlign = "left";
	ctx.fillText(
		`Equipo A (${label}: ${formationA.score.toFixed(1)})`,
		32,
		32,
	);

	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.fillText("UNITGOL · ALINEACIÓN", width / 2, 32);

	ctx.fillStyle = "#fbbf24";
	ctx.textAlign = "right";
	ctx.fillText(
		`Equipo B (${label}: ${formationB.score.toFixed(1)})`,
		width - 32,
		32,
	);

	const pitchX = 36;
	const pitchY = 86;
	const pitchW = width - 72;
	const pitchH = height - 110;

	// Grass stripes
	const stripeCount = 12;
	const stripeW = pitchW / stripeCount;
	for (let i = 0; i < stripeCount; i++) {
		ctx.fillStyle = i % 2 === 0 ? "#15803d" : "#166534";
		ctx.fillRect(pitchX + i * stripeW, pitchY, stripeW, pitchH);
	}

	// Pitch lines
	ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
	ctx.lineWidth = 3;
	ctx.strokeRect(pitchX, pitchY, pitchW, pitchH);

	// Halfway line & center circle
	ctx.beginPath();
	ctx.moveTo(pitchX + pitchW / 2, pitchY);
	ctx.lineTo(pitchX + pitchW / 2, pitchY + pitchH);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(
		pitchX + pitchW / 2,
		pitchY + pitchH / 2,
		72,
		0,
		Math.PI * 2,
	);
	ctx.stroke();

	// Penalty areas
	const areaW = 140;
	const areaH = 280;
	ctx.strokeRect(
		pitchX,
		pitchY + (pitchH - areaH) / 2,
		areaW,
		areaH,
	);
	ctx.strokeRect(
		pitchX + pitchW - areaW,
		pitchY + (pitchH - areaH) / 2,
		areaW,
		areaH,
	);

	drawSoccerBall(ctx, pitchX + pitchW / 2, pitchY + pitchH / 2, 18);

	drawTeamFormation(ctx, formationA, "A", pitchX, pitchY, pitchW, pitchH);
	drawTeamFormation(ctx, formationB, "B", pitchX, pitchY, pitchW, pitchH);

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error("No se pudo generar la imagen del campo."));
				return;
			}
			resolve(
				new File([blob], "unitgol-alineacion-campo.png", {
					type: "image/png",
				}),
			);
		}, "image/png");
	});
}
