import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsCard } from "@/features/news/components/NewsCard";

const news = {
	title: "Javi suma 4 victorias consecutivas",
	body: "Javi anotó 3 goles en una victoria por 7-4.",
};

function mockNewspaperCanvas() {
	const context = {
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 0,
		textAlign: "left",
		font: "",
		fillRect: vi.fn(),
		strokeRect: vi.fn(),
		fillText: vi.fn(),
		measureText: (text: string) => ({ width: text.length * 10 }),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		stroke: vi.fn(),
		drawImage: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		filter: "",
	};
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
		context as unknown as CanvasRenderingContext2D,
	);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
		(callback) => callback(new Blob(["newspaper"], { type: "image/png" })),
	);

	const setSource = vi.fn();
	class MockImage {
		static instance: MockImage;
		crossOrigin: string | null = null;
		naturalWidth = 1400;
		naturalHeight = 560;
		onload: ((event: Event) => void) | null = null;

		constructor() {
			MockImage.instance = this;
		}

		set src(url: string) {
			this.source = url;
			setSource(url);
			queueMicrotask(() => this.onload?.(new Event("load")));
		}

		get src() {
			return this.source;
		}

		private source = "";
	}
	vi.stubGlobal("Image", MockImage);
	return {
		context,
		get image() {
			return MockImage.instance;
		},
		setSource,
	};
}

afterEach(() => {
	Reflect.deleteProperty(navigator, "share");
	Reflect.deleteProperty(navigator, "canShare");
	Reflect.deleteProperty(navigator, "clipboard");
	Reflect.deleteProperty(URL, "createObjectURL");
	Reflect.deleteProperty(URL, "revokeObjectURL");
	Reflect.deleteProperty(document, "fonts");
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("NewsCard", () => {
	it("shares the complete news through the Web Share API", async () => {
		const share = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: share,
		});
		render(<NewsCard news={news} />);
		expect(
			screen.getByRole("img", { name: "Partido de fútbol" }),
		).toHaveAttribute(
			"src",
			"https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&h=560&q=85",
		);

		fireEvent.click(screen.getByRole("button", { name: "Compartir texto" }));

		await waitFor(() => {
			expect(share).toHaveBeenCalledWith({
				title: "UnitGol News",
				text: "📰 ÚLTIMA HORA\n\nJavi suma 4 victorias consecutivas\n\nJavi anotó 3 goles en una victoria por 7-4.",
			});
		});
	});

	it("copies the news when the Web Share API is unavailable", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});
		render(<NewsCard news={news} />);

		fireEvent.click(screen.getByRole("button", { name: "Compartir texto" }));

		await waitFor(() => {
			expect(writeText).toHaveBeenCalledWith(
				"📰 ÚLTIMA HORA\n\nJavi suma 4 victorias consecutivas\n\nJavi anotó 3 goles en una victoria por 7-4.",
			);
			expect(screen.getByRole("status")).toHaveTextContent(
				"Noticia copiada al portapapeles.",
			);
		});
	});

	it("shares the generated newspaper image when file sharing is supported", async () => {
		const share = vi.fn().mockResolvedValue(undefined);
		const canShare = vi.fn().mockReturnValue(true);
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: share,
		});
		Object.defineProperty(navigator, "canShare", {
			configurable: true,
			value: canShare,
		});
		const newspaperCanvas = mockNewspaperCanvas();
		const { context, setSource } = newspaperCanvas;
		const loadFont = vi.fn().mockResolvedValue([]);
		Object.defineProperty(document, "fonts", {
			configurable: true,
			value: { load: loadFont },
		});
		render(<NewsCard news={news} teamName="Los Pichichis" />);

		fireEvent.click(
			screen.getByRole("button", { name: "Compartir periódico" }),
		);

		await waitFor(() => {
			expect(canShare).toHaveBeenCalledWith({
				files: [expect.objectContaining({ type: "image/png" })],
			});
			expect(share).toHaveBeenCalledWith({
				title: "UnitGol News",
				files: [expect.objectContaining({ name: "unitgol-news.png" })],
			});
		});
		expect(setSource).toHaveBeenCalledWith(
			"https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&h=560&q=85",
		);
		expect(context.drawImage).toHaveBeenCalledWith(
			newspaperCanvas.image,
			expect.any(Number),
			expect.any(Number),
			expect.any(Number),
			expect.any(Number),
			92,
			expect.any(Number),
			896,
			420,
		);
		expect(context.save).toHaveBeenCalled();
		expect(context.restore).toHaveBeenCalled();
		expect(context.filter).toBe("grayscale(100%) contrast(1.08)");
		expect(context.fillText).toHaveBeenCalledWith(
			"ÚLTIMA HORA  /  CRÓNICA DEPORTIVA",
			110,
			362,
		);
		expect(context.fillText).toHaveBeenCalledWith(
			"Los Pichichis",
			540,
			160,
			896,
		);
		expect(loadFont).toHaveBeenCalledWith('bold 68px "Rye", Georgia, serif');
		expect(screen.getByRole("heading", { name: news.title })).toHaveStyle({
			fontFamily: '"Rye", Georgia, serif',
		});
		expect(screen.getByRole("img", { name: "Partido de fútbol" })).toHaveClass(
			"grayscale",
		);
		expect(context.textAlign).toBe("center");
	});

	it("downloads the newspaper image when file sharing is unavailable", async () => {
		const createObjectURL = vi.fn().mockReturnValue("blob:unitgol-news");
		const revokeObjectURL = vi.fn();
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: createObjectURL,
		});
		Object.defineProperty(URL, "revokeObjectURL", {
			configurable: true,
			value: revokeObjectURL,
		});
		mockNewspaperCanvas();
		const click = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => {});
		render(<NewsCard news={news} />);

		fireEvent.click(
			screen.getByRole("button", { name: "Compartir periódico" }),
		);

		await waitFor(
			() => {
				expect(createObjectURL).toHaveBeenCalledWith(
					expect.objectContaining({ type: "image/png" }),
				);
				expect(click).toHaveBeenCalled();
				expect(screen.getByRole("status")).toHaveTextContent(
					"Periódico descargado como imagen.",
				);
			},
			{ timeout: 2000 },
		);
		await waitFor(
			() => {
				expect(revokeObjectURL).toHaveBeenCalledWith("blob:unitgol-news");
			},
			{ timeout: 2000 },
		);
	});
});
