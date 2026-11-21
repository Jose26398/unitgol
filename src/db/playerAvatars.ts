import { supabase } from "./supabase";

export const PLAYER_AVATAR_BUCKET = "player-avatars";
export const MAX_PLAYER_AVATAR_SIZE = 2 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export function validatePlayerAvatar(file: File) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("La foto debe estar en formato JPG, PNG o WebP.");
  }
  if (file.size === 0 || file.size > MAX_PLAYER_AVATAR_SIZE) {
    throw new Error("La foto no puede superar los 2 MB.");
  }
}

export function getPlayerAvatarUrl(path: string) {
  return supabase.storage.from(PLAYER_AVATAR_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
