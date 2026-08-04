import type { TranslationKey } from "./tr";

/**
 * @file en.ts
 * @description İngilizce arayüz metinleri.
 *
 * Tip, tr.ts'teki anahtar kümesine bağlıdır: eksik ya da fazla anahtar derleme
 * hatası verir. Böylece "çevrilmemiş metin" sessizce üretime gitmez.
 */
export const en: Record<TranslationKey, string> = {
  // --- Navigation --------------------------------------------------------
  "nav.whiskies": "Whiskies",
  "nav.people": "People",
  "nav.dashboard": "Dashboard",
  "nav.feed": "Feed",
  "nav.myTastings": "My Tastings",
  "nav.favorites": "Favourites",
  "nav.wishlist": "Wishlist",
  "nav.wishlistShort": "Wishlist",
  "nav.compare": "Compare",
  "nav.compareLong": "Compare Whiskies",
  "nav.notifications": "Notifications",
  "nav.login": "Sign In",
  "nav.loginShort": "Sign In",
  "nav.register": "Sign Up",
  "nav.publicProfile": "My Public Profile",
  "nav.profileSettings": "Profile Settings",
  "nav.admin": "Admin",
  "nav.logout": "Sign Out",
  "nav.more": "More",
  "nav.menu": "Menu",

  // --- Accessibility labels ----------------------------------------------
  "a11y.mobileNav": "Mobile navigation",
  "a11y.closeMenu": "Close menu",
  "a11y.close": "Close",
  "a11y.otherPages": "Other pages",
  "a11y.userMenu": "User menu",

  // --- Language switcher --------------------------------------------------
  "locale.label": "Language",
  "locale.tr": "Turkish",
  "locale.en": "English",
  "locale.switchToTr": "Switch the interface to Turkish",
  "locale.switchToEn": "Switch the interface to English",

  // --- Offline use --------------------------------------------------------
  "offline.title": "Offline Use",
  "offline.on": "On",
  "offline.off": "Off",
  "offline.switchOnLabel": "Offline use is on",
  "offline.switchOffLabel": "Offline use is off",
  "offline.actionFailed": "That didn't work.",

  // --- Footer -------------------------------------------------------------
  "footer.tagline": "Your whisky tasting journal — discover, taste, record.",
  "footer.disclaimer": "Enjoy your dram, drink responsibly.",

  // --- Site metadata ------------------------------------------------------
  "meta.title": "CaskKeeper — Your Whisky Tasting Journal",
  "meta.description":
    "Discover whiskies, record how each dram actually tasted to you, and watch your palate evolve. A premium whisky tasting journal.",
};
