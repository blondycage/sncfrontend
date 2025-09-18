'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkChat() {
  useEffect(() => {
    // Initialize Tawk.to variables
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Create and inject the script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/68cc891a7c25221923316572/1j5fff47g';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Find the first script tag and insert before it
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Cleanup function to remove the script when component unmounts
    return () => {
      // Remove the script element
      const tawkScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (tawkScript && tawkScript.parentNode) {
        tawkScript.parentNode.removeChild(tawkScript);
      }

      // Clean up global variables
      if (window.Tawk_API) {
        delete window.Tawk_API;
      }
      if (window.Tawk_LoadStart) {
        delete window.Tawk_LoadStart;
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}