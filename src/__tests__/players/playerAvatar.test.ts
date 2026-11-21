import { describe, expect, it } from "vitest";
import {
  MAX_PLAYER_AVATAR_SIZE,
  validatePlayerAvatar,
} from "@/db/playerAvatars";

describe("validatePlayerAvatar", () => {
  it("allows supported images up to 2 MB", () => {
    expect(() =>
      validatePlayerAvatar(
        new File([new Uint8Array(MAX_PLAYER_AVATAR_SIZE)], "avatar.jpg", {
          type: "image/jpeg",
        }),
      ),
    ).not.toThrow();
  });

  it("rejects oversized and unsupported files", () => {
    expect(() =>
      validatePlayerAvatar(
        new File([new Uint8Array(MAX_PLAYER_AVATAR_SIZE + 1)], "avatar.png", {
          type: "image/png",
        }),
      ),
    ).toThrow("no puede superar los 2 MB");
    expect(() =>
      validatePlayerAvatar(
        new File(["image"], "avatar.svg", { type: "image/svg+xml" }),
      ),
    ).toThrow("JPG, PNG o WebP");
  });
});
