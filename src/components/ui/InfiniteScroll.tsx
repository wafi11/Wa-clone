import React from "react";
import { useInView } from "react-intersection-observer";

interface infintinscroll extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

export default function Infintinscroll({
  children,
  onBottomReached,
  className,
}: infintinscroll) {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={className}>
      {children}
      <div ref={ref} />
    </div>
  );
}
