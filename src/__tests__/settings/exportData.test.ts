// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { exportDatabase } from "@/features/settings/utils/exportData";
import { DEFAULT_SETTINGS } from "@/types";

afterEach(() => {
  Reflect.deleteProperty(URL, "createObjectURL");
  Reflect.deleteProperty(URL, "revokeObjectURL");
  vi.restoreAllMocks();
});
describe("database export", () => {
  it("exports the current scoped snapshot including seasons and settings, then releases the URL", async () => {
    let exported: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      exported = blob;
      return "blob:test";
    });
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const data = {
      players: [],
      matches: [],
      seasons: [{ id: "s1", name: "Season", startDate: "2026-01-01" }],
      settings: DEFAULT_SETTINGS,
    };
    exportDatabase(data);
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    expect(document.querySelector("a[download]")).toBeNull();
    const json = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(exported as Blob);
    });
    expect(JSON.parse(json)).toEqual(data);
  });
});
