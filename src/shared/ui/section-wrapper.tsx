import type { ReactNode } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({ id, children, className = "" }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`relative border-t border-zinc-800/50 bg-zinc-950 py-32 ${className}`}
    >
      {children}
    </section>
  );
}
