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

	// Sombra del balón en el césped
	ctx.beginPath();
	ctx.ellipse(cx, cy + r * 0.95, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
	ctx.fill();

	// Esfera base del balón
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = "#f8fafc";
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#0f172a";
	ctx.stroke();

	// Recorte a la esfera
	ctx.clip();

	// Pentágono central
	const rp = r * 0.35;
	const pts: [number, number][] = [];
	for (let i = 0; i < 5; i++) {
		const angle = (-90 + i * 72) * (Math.PI / 180);
		pts.push([cx + rp * Math.cos(angle), cy + rp * Math.sin(angle)]);
	}

	ctx.beginPath();
	ctx.moveTo(pts[0][0], pts[0][1]);
	for (let i = 1; i < 5; i++) {
		ctx.lineTo(pts[i][0], pts[i][1]);
	}
	ctx.closePath();
	ctx.fillStyle = "#0f172a";
	ctx.fill();

	// Costuras y parches perimetrales
	ctx.strokeStyle = "#0f172a";
	ctx.lineWidth = 1.8;
	ctx.lineCap = "round";

	for (let i = 0; i < 5; i++) {
		const angle = (-90 + i * 72) * (Math.PI / 180);
		const outerX = cx + r * Math.cos(angle);
		const outerY = cy + r * Math.sin(angle);

		// Línea de costura
		ctx.beginPath();
		ctx.moveTo(pts[i][0], pts[i][1]);
		ctx.lineTo(outerX, outerY);
		ctx.stroke();

		// Parche en el borde
		const a1 = angle - 0.26;
		const a2 = angle + 0.26;
		ctx.beginPath();
		ctx.moveTo(outerX, outerY);
		ctx.lineTo(cx + (r + 6) * Math.cos(a1), cy + (r + 6) * Math.sin(a1));
		ctx.lineTo(cx + (r + 6) * Math.cos(a2), cy + (r + 6) * Math.sin(a2));
		ctx.closePath();
		ctx.fillStyle = "#0f172a";
		ctx.fill();
	}

	ctx.restore();
}

function drawPlayerCardOnCanvas(
	ctx: CanvasRenderingContext2D,
	assigned: AssignedPlayer,
	x: number,
	y: number,
	teamColor: "A" | "B",
	_ratingMode: RatingMode,
) {
	const w = 98;
	const photoH = 80;
	const midBarH = 20;
	const footerH = 30;
	const h = photoH + midBarH + footerH; // 130
	const cx = x - w / 2;
	const cy = y - h / 2;

	// Sombra general
	ctx.save();
	ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
	ctx.shadowBlur = 12;
	ctx.shadowOffsetY = 6;

	// Fondo de la tarjeta completo
	drawRoundedRect(ctx, cx, cy, w, h, 12);
	ctx.fillStyle = "#020617";
	ctx.fill();
	ctx.restore();

	// 1. Zona de la foto (fondo con gradiente limpio, sin texto superpuesto)
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(cx + 12, cy);
	ctx.lineTo(cx + w - 12, cy);
	ctx.quadraticCurveTo(cx + w, cy, cx + w, cy + 12);
	ctx.lineTo(cx + w, cy + photoH);
	ctx.lineTo(cx, cy + photoH);
	ctx.lineTo(cx, cy + 12);
	ctx.quadraticCurveTo(cx, cy, cx + 12, cy);
	ctx.closePath();
	ctx.clip();

	// Fondo gradiente estilo tarjeta deportiva
	const grad = ctx.createLinearGradient(cx, cy, cx, cy + photoH);
	grad.addColorStop(0, teamColor === "A" ? "#075985" : "#854d0e");
	grad.addColorStop(1, "#020617");
	ctx.fillStyle = grad;
	ctx.fillRect(cx, cy, w, photoH);

	// Silueta de retrato estilizado centrada en la foto limpia
	ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
	ctx.beginPath();
	ctx.arc(cx + w / 2, cy + 34, 20, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(cx + w / 2, cy + 74, 30, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();

	// 2. Barra intermedia adherida bajo la foto: Posición + Puntuación
	ctx.fillStyle = "rgba(15, 23, 42, 0.98)";
	ctx.fillRect(cx, cy + photoH, w, midBarH);

	// Línea sutil divisoria superior
	ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
	ctx.fillRect(cx, cy + photoH, w, 1);

	// Chip de Posición
	const posInfo = POSITION_COLORS[assigned.tacticalPosition] || {
		bg: "#64748b",
		text: "#ffffff",
		label: assigned.tacticalPosition,
	};

	const chipW = 54;
	const chipH = 14;
	drawRoundedRect(ctx, cx + 4, cy + photoH + 3, chipW, chipH, 3);
	ctx.fillStyle = posInfo.bg;
	ctx.fill();

	ctx.font = "bold 8px sans-serif";
	ctx.fillStyle = posInfo.text;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(posInfo.label, cx + 4 + chipW / 2, cy + photoH + 3 + chipH / 2);

	// Puntuación / ELO a la derecha
	ctx.font = "bold 10px monospace";
	ctx.fillStyle = "#fcd34d"; // amber-300
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillText(
		`${Math.round(assigned.score)}`,
		cx + w - 6,
		cy + photoH + midBarH / 2,
	);

	// 3. Pie de tarjeta: Nombre del jugador y distintivo de equipo
	ctx.fillStyle = "#020617";
	ctx.fillRect(cx, cy + photoH + midBarH, w, footerH);

	// Línea divisoria
	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	ctx.fillRect(cx, cy + photoH + midBarH, w, 1);

	// Nombre
	ctx.font = "bold 10px sans-serif";
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	let name = assigned.player.name;
	if (name.length > 13) {
		name = `${name.substring(0, 12)}…`;
	}
	ctx.fillText(name, cx + w / 2, cy + photoH + midBarH + 11);

	// Indicador de equipo
	ctx.font = "bold 8px sans-serif";
	ctx.fillStyle = teamColor === "A" ? "#38bdf8" : "#fbbf24";
	ctx.fillText(
		teamColor === "A" ? "EQUIPO A" : "EQUIPO B",
		cx + w / 2,
		cy + photoH + midBarH + 21,
	);

	// 4. Borde del equipo con brillo
	ctx.save();
	drawRoundedRect(ctx, cx, cy, w, h, 12);
	ctx.lineWidth = 2.5;
	ctx.strokeStyle = teamColor === "A" ? "#38bdf8" : "#fbbf24";
	ctx.stroke();
	ctx.restore();
}

/**
 * Genera una imagen en PNG del campo de fútbol horizontal enfrentando los dos equipos.
 */
export async function createPitchImage(
	formationA: TeamTacticalFormation,
	formationB: TeamTacticalFormation,
	ratingMode: RatingMode,
): Promise<File> {
	const width = 1300;
	const height = 720;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas.");

	// 1. Fondo de césped a rayas horizontales
	const stripeWidth = 65;
	for (let x = 0; x < width; x += stripeWidth) {
		ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? "#15803d" : "#166534";
		ctx.fillRect(x, 0, stripeWidth, height);
	}

	// 2. Líneas del campo (color blanco semitransparente)
	ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
	ctx.lineWidth = 3;

	const margin = 40;
	const pitchW = width - margin * 2;
	const pitchH = height - margin * 2;
	const midX = width / 2;
	const midY = height / 2;

	// Perímetro
	ctx.strokeRect(margin, margin, pitchW, pitchH);

	// Línea vertical de medio campo
	ctx.beginPath();
	ctx.moveTo(midX, margin);
	ctx.lineTo(midX, height - margin);
	ctx.stroke();

	// Círculo central
	ctx.beginPath();
	ctx.arc(midX, midY, 80, 0, Math.PI * 2);
	ctx.stroke();

	// Balón oficial centrado en el medio campo
	drawSoccerBall(ctx, midX, midY, 18);

	// Área de penalti izquierda (Equipo A)
	const boxW = 140;
	const boxH = 300;
	ctx.strokeRect(margin, midY - boxH / 2, boxW, boxH);

	// Área pequeña izquierda
	ctx.strokeRect(margin, midY - 70, 50, 140);

	// Portería izquierda
	ctx.strokeRect(margin - 14, midY - 50, 14, 100);

	// Área de penalti derecha (Equipo B)
	ctx.strokeRect(width - margin - boxW, midY - boxH / 2, boxW, boxH);

	// Área pequeña derecha
	ctx.strokeRect(width - margin - 50, midY - 70, 50, 140);

	// Portería derecha
	ctx.strokeRect(width - margin, midY - 50, 14, 100);

	// 3. Títulos y Marcador en la parte superior
	ctx.font = "bold 17px sans-serif";
	ctx.fillStyle = "#38bdf8";
	ctx.textAlign = "left";
	ctx.fillText(
		`🔵 EQUIPO A (${ratingMode === "elo" ? "ELO" : "PTS"}: ${formationA.score.toFixed(1)})`,
		margin + 10,
		margin - 14,
	);

	ctx.font = "bold 16px sans-serif";
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.fillText("UNITGOL · ALINEACIÓN FÚTBOL 7", midX, margin - 14);

	ctx.font = "bold 17px sans-serif";
	ctx.fillStyle = "#fbbf24";
	ctx.textAlign = "right";
	ctx.fillText(
		`EQUIPO B (${ratingMode === "elo" ? "ELO" : "PTS"}: ${formationB.score.toFixed(1)}) 🟡`,
		width - margin - 10,
		margin - 14,
	);

	// 4. Posicionar jugadores en el campo (Distribución horizontal)
	// Coordenadas X para las 4 columnas de cada equipo:
	// Equipo A:
	const colA_por = margin + 70;
	const colA_def = margin + 195;
	const colA_med = margin + 335;
	const colA_est = margin + 480;

	// Equipo B:
	const colB_est = width - margin - 480;
	const colB_med = width - margin - 335;
	const colB_def = width - margin - 195;
	const colB_por = width - margin - 70;

	// Y-offsets
	const yCenter = midY;
	const yTop = midY - 170;
	const yBottom = midY + 170;

	// --- DIBUJAR EQUIPO A ---
	// Portero
	drawPlayerCardOnCanvas(
		ctx,
		formationA.portero,
		colA_por,
		yCenter,
		"A",
		ratingMode,
	);

	// Defensas (2)
	if (formationA.defensas[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationA.defensas[0],
			colA_def,
			yTop + 20,
			"A",
			ratingMode,
		);
	}
	if (formationA.defensas[1]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationA.defensas[1],
			colA_def,
			yBottom - 20,
			"A",
			ratingMode,
		);
	}

	// Bandas y Medios (3)
	if (formationA.bandas[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationA.bandas[0],
			colA_med,
			yTop,
			"A",
			ratingMode,
		);
	}
	if (formationA.medios[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationA.medios[0],
			colA_med,
			yCenter,
			"A",
			ratingMode,
		);
	}
	if (formationA.bandas[1]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationA.bandas[1],
			colA_med,
			yBottom,
			"A",
			ratingMode,
		);
	}

	// Estaca
	if (formationA.estacas[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationA.estacas[0],
			colA_est,
			yCenter,
			"A",
			ratingMode,
		);
	}

	// --- DIBUJAR EQUIPO B ---
	// Estaca
	if (formationB.estacas[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationB.estacas[0],
			colB_est,
			yCenter,
			"B",
			ratingMode,
		);
	}

	// Bandas y Medios (3)
	if (formationB.bandas[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationB.bandas[0],
			colB_med,
			yTop,
			"B",
			ratingMode,
		);
	}
	if (formationB.medios[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationB.medios[0],
			colB_med,
			yCenter,
			"B",
			ratingMode,
		);
	}
	if (formationB.bandas[1]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationB.bandas[1],
			colB_med,
			yBottom,
			"B",
			ratingMode,
		);
	}

	// Defensas (2)
	if (formationB.defensas[0]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationB.defensas[0],
			colB_def,
			yTop + 20,
			"B",
			ratingMode,
		);
	}
	if (formationB.defensas[1]) {
		drawPlayerCardOnCanvas(
			ctx,
			formationB.defensas[1],
			colB_def,
			yBottom - 20,
			"B",
			ratingMode,
		);
	}

	// Portero
	drawPlayerCardOnCanvas(
		ctx,
		formationB.portero,
		colB_por,
		yCenter,
		"B",
		ratingMode,
	);

	// Convertir canvas a Blob/File
	return new Promise<File>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error("No se pudo generar la imagen del campo."));
				return;
			}
			const file = new File([blob], "unitgol-alineacion-campo.png", {
				type: "image/png",
			});
			resolve(file);
		}, "image/png");
	});
}
