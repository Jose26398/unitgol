// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPitchImage } from "@/features/team-generator/utils/pitchImage";
import { assignTacticalPositions } from "@/features/team-generator/utils/tacticalPositions";
import type { Player } from "@/types";

const makePlayers = (size: number): Player[] =>
  Array.from({ length: size }, (_, i) => ({
    id: String(i),
    name: i === 0 ? "A very long player name" : `Player ${i}`,
    matches: 10,
    wins: 5,
    losses: 3,
    goals: i % 5,
    assists: i % 3,
  }));
const formation = (size: number) =>
  assignTacticalPositions(makePlayers(size), (p) => p.goals + p.assists);
const context = {
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
  arc: vi.fn(),
  clip: vi.fn(),
  ellipse: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  strokeRect: vi.fn(),
  createRadialGradient: () => ({ addColorStop: vi.fn() }),
};
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback) => callback(new Blob(["png"], { type: "image/png" })),
  );
});
afterEach(() => vi.restoreAllMocks());

describe("pitch image export", () => {
  it.each([1, 2, 4, 6, 7, 10])(
    "exports a PNG with %i players per team",
    async (count) => {
      const file = await createPitchImage(
        formation(count),
        formation(count),
        count % 2 ? "elo" : "score",
      );
      expect(file.name).toBe("unitgol-alineacion-campo.png");
      expect(file.type).toBe("image/png");
      expect(file.size).toBeGreaterThan(0);
      expect(context.fillText).toHaveBeenCalled();
    },
  );
  it("reports a missing canvas context", async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    await expect(
      createPitchImage(formation(1), formation(1), "score"),
    ).rejects.toThrow("contexto");
  });
  it("reports a browser failure to encode the PNG", async () => {
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(
      (callback) => callback(null),
    );
    await expect(
      createPitchImage(formation(7), formation(7), "score"),
    ).rejects.toThrow("generar la imagen");
  });
  it("refuses an empty squad before assigning a goalkeeper", () => {
    expect(() => formation(0)).toThrow("No hay jugadores");
  });
});
