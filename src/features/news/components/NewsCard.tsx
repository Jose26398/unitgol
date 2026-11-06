import { Newspaper, Share } from "lucide-react";
import { useState } from "react";
import type { UnitGolNews } from "@/features/news/utils/news";
import {
	createNewspaperImage,
	UNITGOL_NEWS_PHOTO_URLS,
} from "@/features/news/utils/newspaperImage";

interface NewsCardProps {
	news: UnitGolNews;
	teamName?: string;
}

export function NewsCard({ news, teamName = "UNITGOL NEWS" }: NewsCardProps) {
	const [shareStatus, setShareStatus] = useState<string | null>(null);
	const shareText = `📰 ÚLTIMA HORA\n\n${news.title}\n\n${news.body}`;

	const handleShareText = async () => {
		setShareStatus(null);
		try {
			if (navigator.share) {
				await navigator.share({ title: "UnitGol News", text: shareText });
				return;
			}

			if (!navigator.clipboard?.writeText) {
				throw new Error("El navegador no permite compartir ni copiar.");
			}

			await navigator.clipboard.writeText(shareText);
			setShareStatus("Noticia copiada al portapapeles.");
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			console.error("Error al compartir la noticia:", error);
			setShareStatus("No se pudo compartir la noticia. Inténtalo de nuevo.");
		}
	};

	const handleShareImage = async () => {
		setShareStatus(null);
		try {
			const image = await createNewspaperImage(news, teamName);
			if (navigator.canShare?.({ files: [image] }) && navigator.share) {
				await navigator.share({
					title: "UnitGol News",
					files: [image],
				});
				return;
			}

			const url = URL.createObjectURL(image);
			const link = document.createElement("a");
			link.href = url;
			link.download = image.name;
			link.click();
			window.setTimeout(() => URL.revokeObjectURL(url), 1000);
			setShareStatus("Periódico descargado como imagen.");
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			console.error("Error al compartir el periódico:", error);
			setShareStatus("No se pudo generar o compartir la imagen.");
		}
	};

	return (
		<article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="mb-3 inline-block bg-[#8c3028] px-3 py-1 font-serif text-sm font-bold italic tracking-wider text-[#fffdf4]">
						📰 ÚLTIMA HORA · CRÓNICA DEPORTIVA
					</p>
					<h3
						className="text-2xl font-bold italic text-gray-900"
						style={{ fontFamily: '"Rye", Georgia, serif' }}
					>
						{news.title}
					</h3>
					<img
						src={UNITGOL_NEWS_PHOTO_URLS[Math.floor(Math.random() * UNITGOL_NEWS_PHOTO_URLS.length)]}
						alt="Partido de fútbol"
						loading="lazy"
						className="mt-4 max-h-64 w-full rounded-md object-cover grayscale"
					/>
					<p className="mt-1 text-right text-xs text-gray-500">
						Foto: la jugada de la jornada (imagen aleatoria)
					</p>
					<p className="mt-3 font-serif leading-relaxed text-gray-700">
						{news.body}
					</p>
				</div>
				<div className="flex shrink-0 flex-col gap-2 sm:flex-row">
					<button
						type="button"
						onClick={handleShareImage}
						className="flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-white transition-colors hover:bg-emerald-800"
					>
						<Newspaper className="h-5 w-5" />
						Compartir periódico
					</button>
					<button
						type="button"
						onClick={handleShareText}
						className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
					>
						<Share className="h-5 w-5" />
						Compartir texto
					</button>
				</div>
			</div>
			{shareStatus && (
				<p className="mt-3 text-sm text-gray-700" role="status">
					{shareStatus}
				</p>
			)}
		</article>
	);
}
