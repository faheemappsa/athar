import { useEffect, useState } from "react";

export const useScrollFocus = (threshold = 28) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    const handleScroll = () => {
      setIsFocused(scrollElement.scrollTop > threshold);
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isFocused;
};
