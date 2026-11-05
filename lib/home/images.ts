import fs from "node:fs";
import path from "node:path";

/** Returns the public URL of an optional photo (public/home/<rel>.jpg|jpeg|webp|png) or null. Server only. */
export function photo(rel: string): string | null {
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", "home", `${rel}.${ext}`))) return `/home/${rel}.${ext}`;
  }
  return null;
}
