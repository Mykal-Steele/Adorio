import React, { useEffect } from "react";

// Explicitly loads AdSense script for React pages
const AdSenseScript = () => {
  useEffect(() => {
    // Check if script already exists to avoid duplicates
    if (document.querySelector('script[src*="adsbygoogle"]')) return;

    const script = document.createElement("script");
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1872365375645260";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
};

export default AdSenseScript;
