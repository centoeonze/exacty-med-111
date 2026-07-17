import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

const SectionContainer = ({ children, id, className = "" }: SectionContainerProps) => (
  <section id={id} className={`section-spacing px-5 md:px-8 ${className}`}>
    <div className="container mx-auto max-w-6xl">
      {children}
    </div>
  </section>
);

export default SectionContainer;
