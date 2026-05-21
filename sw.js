{
  "name": "أثر — كل يوم أثر نور",
  "short_name": "أثر",
  "description": "تجربة روحانية عربية مع مواقيت صلاة دقيقة، أذكار، وبطاقات يومية فاخرة",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "theme_color": "#1B6B6F",
  "background_color": "#1B6B6F",
  "lang": "ar",
  "dir": "rtl",
  "scope": "/",
  "orientation": "portrait",
  "categories": ["lifestyle", "utilities", "religion"],
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "screenshot-home.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "الصفحة الرئيسية — أثر اليوم"
    },
    {
      "src": "screenshot-prayer.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "مواقيت الصلاة والإقامة"
    }
  ],
  "shortcuts": [
    {
      "name": "أذكار الصباح",
      "short_name": "الصباح",
      "description": "افتح أذكار الصباح مباشرة",
      "url": "/?action=morning-dhikr",
      "icons": [{ "src": "shortcut-morning.png", "sizes": "96x96" }]
    },
    {
      "name": "أذكار المساء",
      "short_name": "المساء",
      "description": "افتح أذكار المساء مباشرة",
      "url": "/?action=evening-dhikr",
      "icons": [{ "src": "shortcut-evening.png", "sizes": "96x96" }]
    },
    {
      "name": "مواقيت الصلاة",
      "short_name": "الصلاة",
      "description": "اعرض مواقيت الصلاة الحالية",
      "url": "/?action=prayer-times",
      "icons": [{ "src": "shortcut-prayer.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
