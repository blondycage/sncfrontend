"use client"

import { useEffect } from 'react'
import { Languages } from 'lucide-react'

declare global {
  interface Window {
    gtranslateSettings: any;
  }
}

// Global state to ensure GTranslate script is loaded only once
let scriptLoaded = false;

const GTranslateWidget = ({ id }: { id?: string } = {}) => {
  useEffect(() => {
    // Only load script once globally
    if (scriptLoaded) return;
    
    // Create the GTranslate configuration for mobile-friendly dropdown
    window.gtranslateSettings = {
      "default_language": "en",
      "languages": ["en", "tr", "el", "fr", "de", "ar", "ru", "es", "it", "pt"],
      "wrapper_selector": ".gtranslate_wrapper",
      "horizontal_position": "inline",
      "flag_style": "2d",
      "flag_size": 16,
      "alt_flags": {
        "en": "usa",
        "tr": "turkey", 
        "el": "greece"
      },
      "switcher_horizontal_position": "inline",
      "switcher_text_color": "hsl(var(--foreground))",
      "switcher_arrow_color": "hsl(var(--foreground))",
      "switcher_border_color": "hsl(var(--border))",
      "switcher_background_color": "hsl(var(--background))",
      "switcher_background_shadow_color": "transparent",
      "switcher_background_hover_color": "hsl(var(--accent))",
      "dropdown_text_color": "hsl(var(--foreground))",
      "dropdown_hover_color": "hsl(var(--accent))",
      "dropdown_background_color": "hsl(var(--background))"
    };

    // Load GTranslate script
    const loadScript = () => {
      // Check if script already exists to avoid duplicates
      const existingScript = document.querySelector('script[src*="gtranslate.net"]');
      if (existingScript) {
        scriptLoaded = true;
        return;
      }

      // Create new script element
      const script = document.createElement('script');
      script.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('GTranslate script loaded');
        scriptLoaded = true;
      };
      
      script.onerror = () => {
        console.error('Failed to load GTranslate script');
      };
      
      document.head.appendChild(script);
    };

    // Load script after a short delay to ensure DOM is ready
    const timer = setTimeout(loadScript, 200);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <div className="gtranslate_wrapper relative" data-gtranslate-id={id}></div>
    </div>
  );
};

export default GTranslateWidget;