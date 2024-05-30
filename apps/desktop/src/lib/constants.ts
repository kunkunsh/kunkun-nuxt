import { z } from "zod";
import { appDataDir, join } from "@tauri-apps/api/path";
import { PermissionsEnum } from "jarvis-api";

const appDataDirPath = await appDataDir();
export const extensionsFolder = await join(appDataDirPath, "extensions");
export const SUPABASE_URL = z
  .string()
  .min(10)
  .parse(import.meta.env.PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = z
  .string()
  .min(10)
  .parse(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
export const SUPABASE_GRAPHQL_ENDPOINT = z
  .string()
  .min(10)
  .parse(import.meta.env.PUBLIC_SUPABASE_GRAPHQL_ENDPOINT);
export const FileStorageUrl = "";

// PermissionsEnum.
const PermissionExplain = z.record(
  PermissionsEnum,
  z.object({ displayName: z.string(), description: z.string() }),
);
type PermissionExplain = z.infer<typeof PermissionExplain>;
export const PERMISSIONS_EXPLANATION: PermissionExplain = {
  "clipboard-read": {
    displayName: "Read Clipboard",
    description:
      "Access to read clipboard data. Including text, html, RTF, image, file paths and monitoring clipboard content update.",
  },
  "clipboard-write": {
    displayName: "Write Clipboard",
    description:
      "Access to write clipboard data. Write text, html, RTF, image, file paths to clipboard.",
  },
  "fs-home": {
    displayName: "Home Directory",
    description: "Read and Write Access to the home directory",
  },
};
