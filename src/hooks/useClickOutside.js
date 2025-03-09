import { useEffect } from "react";

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    // closes stuff when you click outside it - took me way too long to figure this out
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

export default useClickOutside;
