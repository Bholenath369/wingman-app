// src/components/TabTransition.jsx
import { useEffect, useRef, useState } from "react";

export default function TabTransition({ activeTab, children }) {
  const [displayTab, setDisplayTab] = useState(activeTab);
  const [animating, setAnimating]   = useState(false);
  const [direction, setDirection]   = useState(1); // 1 = right, -1 = left
  const prevTabRef = useRef(activeTab);

  const TAB_ORDER = ["analyze", "personality", "coach", "simulate", "profile"];

  useEffect(() => {
    if (activeTab === displayTab) return;
    const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
    const nextIdx = TAB_ORDER.indexOf(activeTab);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    setAnimating(true);

    const timer = setTimeout(() => {
      setDisplayTab(activeTab);
      prevTabRef.current = activeTab;
      setAnimating(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const exitStyle = animating ? {
    opacity: 0,
    transform: `translateX(${direction * -28}px) scale(0.97)`,
    filter: "blur(4px)",
    transition: "opacity 0.22s ease, transform 0.22s ease, filter 0.22s ease",
  } : {};

  const enterStyle = !animating ? {
    opacity: 1,
    transform: "translateX(0) scale(1)",
    filter: "blur(0)",
    transition: "opacity 0.3s cubic-bezier(0.34,1.2,0.64,1), transform 0.3s cubic-bezier(0.34,1.2,0.64,1), filter 0.25s ease",
  } : {
    opacity: 0,
    transform: `translateX(${direction * 28}px) scale(0.97)`,
    filter: "blur(4px)",
  };

  return (
    <div
      style={{
        ...enterStyle,
        willChange: "transform, opacity, filter",
        minHeight: "100%",
      }}
    >
      {children(displayTab)}
    </div>
  );
}
