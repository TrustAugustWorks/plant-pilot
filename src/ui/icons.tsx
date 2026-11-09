// Line icons, 24x24, stroke-based (docs/ui.md: no emoji).
import type { IconName } from '../domain/types';

type UiIcon = 'droplet' | 'calendar' | 'download' | 'upload' | 'pencil' | 'check' | 'x' | 'copy' | 'external' | 'image' | 'alert';

const PATHS: Record<IconName | UiIcon, React.ReactNode> = {
  leaf: <><path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z" /><path d="M5 19l8-8" /></>,
  sprout: <><path d="M12 21v-9" /><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z" /><path d="M12 10c0-4 3-6 7-6 0 4-3 6-7 6z" /></>,
  flower: <><circle cx="12" cy="5.5" r="2.5" /><circle cx="15.5" cy="9" r="2.5" /><circle cx="12" cy="12.5" r="2.5" /><circle cx="8.5" cy="9" r="2.5" /><path d="M12 15v6" /><path d="M12 19c-2 0-3.5-1-4-3" /></>,
  cactus: <><path d="M10 21V5a2 2 0 0 1 4 0v16" /><path d="M14 13h2a2 2 0 0 0 2-2V8" /><path d="M10 15H8a2 2 0 0 1-2-2v-3" /><path d="M7 21h10" /></>,
  tree: <><path d="M12 21V11" /><path d="M12 11C10 7.5 6 6.5 3 8.5" /><path d="M12 11c2-3.5 6-4.5 9-2.5" /><path d="M12 11c-1-3.5-3.5-6-7-6.5" /><path d="M12 11c1-3.5 3.5-6 7-6.5" /></>,
  herb: <><path d="M12 21V8" /><path d="M12 15c-3 0-5-2-5-5 3 0 5 2 5 5z" /><path d="M12 12c3 0 5-2 5-5-3 0-5 2-5 5z" /><path d="M12 8c-1.5 0-2.5-1.5-2.5-3.5 1.5 0 2.5 1.5 2.5 3.5z" /></>,
  fruit: <><circle cx="12" cy="14" r="6" /><path d="M12 8V4" /><path d="M12 6c1.5-2 3.5-2 5-1.5" /></>,
  droplet: <path d="M12 2.7c-3.2 4-5.5 7.2-5.5 10.3a5.5 5.5 0 0 0 11 0c0-3.1-2.3-6.3-5.5-10.3z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  upload: <path d="M12 21V9M7 14l5-5 5 5M5 3h14" />,
  pencil: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  check: <path d="M5 12l5 5 9-10" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  alert: <><path d="M12 7v6" /><path d="M12 17h.01" /></>,
};

export function Icon({ name, size = 20, title }: { name: IconName | UiIcon; size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} focusable="false">
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  );
}
