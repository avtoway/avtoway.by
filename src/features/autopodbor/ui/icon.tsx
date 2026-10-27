const paths: Record<string, React.ReactNode> = {
  eye: <><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3L20 3m-3 3l2 2m-4 4l2 2" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.75 5.5 3.75 9S14.5 18.5 12 21c-2.5-2.5-3.75-5.5-3.75-9S9.5 5.5 12 3z" /></>,
  document: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></>,
  scale: <><path d="M12 3v18M7 21h10M5 7h14" /><path d="M7 7l-3 6h6L7 7zm10 0l-3 6h6l-3-6z" /></>,
  car: <><path d="M5 17h14M6.5 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm14 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M4 17v-4l2-5h12l2 5v4M4 13h16" /></>,
  gauge: <><path d="M12 21a9 9 0 110-18 9 9 0 010 18z" /><path d="M12 12l4-4M7 17h10" /></>,
  shield: <><path d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
  wrench: <><path d="M14.7 6.3a4 4 0 105.4 5.4L9.4 22.4l-2.8-2.8L17.3 8.9" /><path d="M14.7 6.3l3-3 3 3-3 3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  dollar: <><path d="M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" /></>,
  telegram: <><path d="M21 4L3 11l5 2 2 6 3-4 5 3 3-14z" /><path d="M8 13l8-6-5 8" /></>,
  phone: <><path d="M4 4h4l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v4a2 2 0 01-2 2A17 17 0 012 6a2 2 0 012-2z" /></>,
  star: <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.9L12 3.5z" /></>,
  "arrow-right": <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  "chevron-down": <><path d="M6 9l6 6 6-6" /></>,
  whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 01-12.6 7.5L3 20.5l1.5-4.8A8.5 8.5 0 1120.5 11.5z" /><path d="M8.5 8.5c.5 3 2.5 5 5.5 5.5" /></>,
  viber: <><path d="M12 3a8 8 0 00-8 8v3l2 4h5l3 3 1-4a8 8 0 00-3-14z" /><path d="M9 9c1 1 3 1.5 4 1.5" /></>,
  "map-pin": <><path d="M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.8M18 20a6 6 0 00-3-5.2" /></>,
  spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></>,
};

export default function AutoIcon({
  name,
  className = "h-6 w-6",
}: {
  name?: string | null;
  className?: string;
}) {
  const content = paths[name ?? "check"] ?? paths.check;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
