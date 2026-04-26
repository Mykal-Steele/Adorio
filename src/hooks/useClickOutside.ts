import { useEffect } from "react";

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    // closes dropdowns when you click anywhere else - stole this from stackoverflow
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]); // had to add callback to deps or react yells at me with warnings
};

export default useClickOutside;
