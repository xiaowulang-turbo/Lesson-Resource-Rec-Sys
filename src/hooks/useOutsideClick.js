import { useEffect, useRef } from "react";

export default function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  // Can not be called conditionally
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    };

    // Capture phrase
    document.addEventListener("click", handleClickOutside, listenCapturing);

    // Clean up
    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside,
        listenCapturing
      );
    };
  }, [handler]);

  return ref;
}
