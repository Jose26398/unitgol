import type { UnitGolNews } from "@/features/news/utils/news";

export const UNITGOL_NEWS_PHOTO_URLS = [
	"https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1748112444120-a0768b1dc582?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1771077508493-c79cd2634c3d?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1752681304917-453df272eed7?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1745103598675-85df75773d12?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1752614654887-0b8d59c076b0?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1778426678037-e18fcf2075f2?auto=format&fit=crop&w=1400&h=560&q=85",
	"https://images.unsplash.com/photo-1776465960039-56157d2814e0?auto=format&fit=crop&w=1400&h=560&q=85"
];

const newspaperSerif = '"Almendra", Georgia, serif';
const newspaperDisplay = '"Rye", Georgia, serif';

function wrapText(
	context: CanvasRenderingContext2D,
	text: string,
	width: number,
) {
	const lines: string[] = [];
	let line = "";

	for (const word of text.split(/\s+/)) {
		const candidate = line ? `${line} ${word}` : word;
		if (line && context.measureText(candidate).width > width) {
			lines.push(line);
			line = word;
		} else {
			line = candidate;
		}
	}
	if (line) lines.push(line);
	return lines;
}

function drawLines(
	context: CanvasRenderingContext2D,
	lines: string[],
	x: number,
	y: number,
	lineHeight: number,
	textAlign: CanvasTextAlign = "left",
) {
	context.textAlign = textAlign;
	lines.forEach((line, index) => {
		context.fillText(line, x, y + index * lineHeight);
	});
}

function loadNewsPhoto() {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.onload = () => resolve(image);
		image.onerror = () =>
			reject(new Error("No se pudo cargar la foto del periódico."));
		image.src =
			UNITGOL_NEWS_PHOTO_URLS[
				Math.floor(Math.random() * UNITGOL_NEWS_PHOTO_URLS.length)
			];
	});
}

function drawCoverPhoto(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	x: number,
	y: number,
	width: number,
	height: number,
) {
	const scale = Math.max(
		width / image.naturalWidth,
		height / image.naturalHeight,
	);
	const sourceWidth = width / scale;
	const sourceHeight = height / scale;
	const sourceX = (image.naturalWidth - sourceWidth) / 2;
	const sourceY = (image.naturalHeight - sourceHeight) / 2;

	context.save();
	context.filter = "grayscale(100%) contrast(1.08)";
	context.drawImage(
		image,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		x,
		y,
		width,
		height,
	);
	context.restore();
}

export async function createNewspaperImage(
	news: UnitGolNews,
	teamName = "UNITGOL NEWS",
): Promise<File> {
	const image = await loadNewsPhoto();
	await Promise.all([
		document.fonts?.load(`bold 68px ${newspaperDisplay}`),
		document.fonts?.load(`bold 68px ${newspaperSerif}`),
	]);
	const canvas = document.createElement("canvas");
	canvas.width = 1080;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("No se pudo crear la imagen de la noticia.");

	const contentX = 92;
	const contentWidth = canvas.width - 184;
	const titleY = 465;
	const titleLineHeight = 82;
	const photoHeight = 420;
	const bodyLineHeight = 54;
	context.font = `bold 68px ${newspaperDisplay}`;
	const titleLines = wrapText(context, news.title, contentWidth);
	const photoY = titleY + titleLines.length * titleLineHeight;
	const bodyY = photoY + photoHeight + 124;
	context.font = `34px ${newspaperSerif}`;
	const bodyLines = wrapText(context, news.body, contentWidth);
	const footerLineY = bodyY + bodyLines.length * bodyLineHeight + 76;
	canvas.height = footerLineY + 150;

	context.fillStyle = "#f5f0e5";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = "#20251f";
	context.lineWidth = 3;
	context.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

	context.fillStyle = "#20251f";
	context.textAlign = "center";
	context.font = `bold italic 84px ${newspaperDisplay}`;
	context.fillText(`${teamName} News`, canvas.width / 2, 160, contentWidth);
	context.font = `24px ${newspaperSerif}`;
	context.fillText("EL FÚTBOL SE CUENTA AQUÍ", canvas.width / 2, 207);

	context.textAlign = "left";
	context.fillStyle = "#8c3028";
	context.font = "bold 22px Arial, sans-serif";
	context.fillText("EDICIÓN EXTRA", contentX, 270);
	context.textAlign = "right";
	context.fillStyle = "#5f625b";
	context.font = `22px ${newspaperSerif}`;
	context.fillText(
		new Intl.DateTimeFormat("es-ES", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}).format(new Date()),
		canvas.width - contentX,
		270,
	);

	context.strokeStyle = "#20251f";
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(contentX, 294);
	context.lineTo(canvas.width - contentX, 294);
	context.stroke();

	context.textAlign = "left";
	context.fillStyle = "#8c3028";
	context.fillRect(contentX, 326, contentWidth, 54);
	context.fillStyle = "#fffdf4";
	context.font = `italic bold 26px ${newspaperSerif}`;
	context.fillText("ÚLTIMA HORA  /  CRÓNICA DEPORTIVA", contentX + 18, 362);

	context.fillStyle = "#20251f";
	context.font = `bold 68px ${newspaperDisplay}`;
	drawLines(
		context,
		titleLines,
		canvas.width / 2,
		titleY,
		titleLineHeight,
		"center",
	);

	drawCoverPhoto(context, image, contentX, photoY, contentWidth, photoHeight);
	context.fillStyle = "rgba(0, 0, 0, 0.65)";
	context.fillRect(contentX, photoY + photoHeight - 48, contentWidth, 48);
	context.fillStyle = "#fffdf4";
	context.textAlign = "left";
	context.font = "italic bold 16px Arial, sans-serif";
	context.fillText(
		"DEPORTES · Liga antiprofesional de fútbol",
		contentX + 20,
		photoY + photoHeight - 17,
	);
	context.textAlign = "right";
	context.fillStyle = "#5f625b";
	context.font = `italic 18px ${newspaperSerif}`;
	context.fillText(
		"Foto: la jugada de la jornada (imagen aleatoria)",
		canvas.width - contentX,
		photoY + photoHeight + 32,
	);

	context.fillStyle = "#343730";
	context.font = `34px ${newspaperSerif}`;
	drawLines(context, bodyLines, contentX, bodyY, bodyLineHeight);

	context.strokeStyle = "#aaa18f";
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(contentX, footerLineY);
	context.lineTo(canvas.width - contentX, footerLineY);
	context.stroke();

	context.fillStyle = "#5f625b";
	context.textAlign = "center";
	context.font = `22px ${newspaperSerif}`;
	context.fillText(
		"UNITGOL · CRÓNICA DE UNA JORNADA INOLVIDABLE",
		canvas.width / 2,
		footerLineY + 52,
	);

	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((result) => {
			if (result) resolve(result);
			else reject(new Error("No se pudo generar la imagen de la noticia."));
		}, "image/png");
	});

	return new File([blob], "unitgol-news.png", { type: "image/png" });
}
