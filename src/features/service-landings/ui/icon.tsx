const paths: Record<string, React.ReactNode> = {
  truck: (
    <>
      <path d="M3 16V6h10v10M13 9h4l3 3v4h-7" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.75 5.5 3.75 9S14.5 18.5 12 21c-2.5-2.5-3.75-5.5-3.75-9S9.5 5.5 12 3z" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.7 6.3a4 4 0 105.4 5.4L9.4 22.4l-2.8-2.8L17.3 8.9" />
      <path d="M14.7 6.3l3-3 3 3-3 3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h3.5a3 3 0 000-6H11a3 3 0 010-6h5" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3L20 3m-3 3l2 2m-4 4l2 2" />
    </>
  ),
  gauge: (
    <>
      <path d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
      <path d="M12 12l4-4M7 17h10" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  phone: (
    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v4a2 2 0 01-2 2A17 17 0 012 6a2 2 0 012-2z" />
  ),
  "arrow-right": <path d="M4 12h16M14 6l6 6-6 6" />,
  "map-pin": (
    <>
      <path d="M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.8M18 20a6 6 0 00-3-5.2" />
    </>
  ),
  dollar: (
    <path d="M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" />
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />,
  camera: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3.5 10h17" />
    </>
  ),
  car: (
    <>
      <path d="M5 17h14M6.5 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm14 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      <path d="M4 17v-4l2-5h12l2 5v4M4 13h16" />
    </>
  ),
  fuel: (
    <>
      <path d="M5 21V4a1 1 0 011-1h7a1 1 0 011 1v17H5zM5 11h9" />
      <path d="M14 8h2l3 3v7a2 2 0 01-4 0v-4" />
    </>
  ),
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
};

export default function LandingIcon({
  name,
  className = "h-6 w-6",
}: {
  name: string;
  className?: string;
}) {
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
      {paths[name] ?? paths.check}
    </svg>
  );
}
