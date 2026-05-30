import type { IconifyIcon } from "@iconify/types";
import imagePlusIcon from "@iconify-icons/lucide/image-plus";

export const DROPZONE_ICONS = {
  upload: imagePlusIcon,
} as const satisfies Record<string, IconifyIcon>;
