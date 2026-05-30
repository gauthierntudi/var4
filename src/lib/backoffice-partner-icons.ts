import type { IconifyIcon } from "@iconify/types";
import eyeIcon from "@iconify-icons/lucide/eye";
import eyeOffIcon from "@iconify-icons/lucide/eye-off";
import externalLinkIcon from "@iconify-icons/lucide/external-link";
import pencilIcon from "@iconify-icons/lucide/pencil";
import trash2Icon from "@iconify-icons/lucide/trash-2";
import xIcon from "@iconify-icons/lucide/x";

export const BACKOFFICE_PARTNER_ICONS = {
  publish: eyeIcon,
  hide: eyeOffIcon,
  external: externalLinkIcon,
  edit: pencilIcon,
  delete: trash2Icon,
  close: xIcon,
} as const satisfies Record<string, IconifyIcon>;
