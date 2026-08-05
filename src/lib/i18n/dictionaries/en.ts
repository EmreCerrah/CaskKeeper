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

  // --- Shared actions -----------------------------------------------------
  "common.search": "Search",
  "common.clearSearch": "Clear search",
  "common.pagination": "Pagination",
  "common.yes": "Yes",
  "common.no": "No",
  "common.searchFailed": "Search failed",

  // --- 404 ----------------------------------------------------------------
  "notFound.title": "Page Not Found",
  "notFound.body":
    "The page you are after may have been left to rest in a cask. Head back to the catalogue and keep exploring.",
  "notFound.cta": "Back to the Catalogue",

  // --- Sign in / Sign up --------------------------------------------------
  "auth.login.heading": "Welcome Back",
  "auth.login.subtitle": "Sign in to pick up your tasting journal where you left it.",
  "auth.login.noAccount": "No account yet?",
  "auth.login.registerLink": "Sign up",
  "auth.login.submit": "Sign In",
  "auth.login.failed": "Could not sign you in",

  "auth.register.heading": "Start Your Journal",
  "auth.register.subtitle": "Create a free account and write your first tasting note today.",
  "auth.register.submit": "Create Account",
  "auth.register.failed": "Could not create your account",
  "auth.register.hasAccount": "Already have an account?",
  "auth.register.loginLink": "Sign in",

  "auth.field.name": "Name",
  "auth.field.namePlaceholder": "Your full name",
  "auth.field.email": "Email",
  "auth.field.emailPlaceholder": "you@example.com",
  "auth.field.password": "Password",
  "auth.field.passwordConfirm": "Password (again)",
  "auth.showPassword": "Show password",
  "auth.hidePassword": "Hide password",

  "auth.validation.nameMin": "Name must be at least 2 characters",
  "auth.validation.nameMax": "Name can be at most 60 characters",
  "auth.validation.email": "Enter a valid email address",
  "auth.validation.passwordMin": "Password must be at least 8 characters",
  "auth.validation.passwordMax": "Password can be at most 72 characters",
  "auth.validation.passwordRequired": "Password is required",
  "auth.validation.passwordMismatch": "Passwords do not match",

  // --- Whisky catalogue ---------------------------------------------------
  "catalogue.title": "Whisky Catalogue",
  "catalogue.count": "Explore {count} whiskies.",
  "catalogue.empty": "The catalogue looks empty right now.",
  "catalogue.noResults": "No whisky matches those filters.",
  "catalogue.searchPlaceholder": "Search brand, name or distillery…",
  "catalogue.searchLabel": "Search whiskies",
  "catalogue.filterType": "Filter by type",
  "catalogue.filterRegion": "Filter by region",
  "catalogue.filterCountry": "Filter by country",
  "catalogue.allTypes": "All Types",
  "catalogue.allRegions": "All Regions",
  "catalogue.allCountries": "All Countries",
  "catalogue.limitedEdition": "Limited Edition",

  // --- Whisky detail ------------------------------------------------------
  "whiskey.notFound": "Whisky Not Found",
  "whiskey.abv": "ABV",
  "whiskey.age": "Age",
  "whiskey.ageYears": "{age} Years",
  "whiskey.distillery": "Distillery",
  "whiskey.caskType": "Cask Type",
  "whiskey.bottlingYear": "Bottling Year",
  "whiskey.region": "Region",
  "whiskey.country": "Country",
  "whiskey.wishlistAdd": "Add to Wishlist",
  "whiskey.wishlistAdded": "On Your Wishlist",
  "whiskey.type": "Type",
  "whiskey.vintage": "Vintage",
  "whiskey.backToCatalogue": "Back to Catalogue",
  "whiskey.flavorProfile": "Flavour Profile",
  "whiskey.awards": "Awards",
  "whiskey.writeNote": "Write a Tasting Note",
  "whiskey.officialPage": "Official Page",
  "whiskey.myNotesTitle": "My Tastings of This Whisky",
  "whiskey.noNotesYet":
    "You haven't tasted this one yet. Use the button above to write your first note.",

  // --- Comparison ---------------------------------------------------------
  "compare.title": "Compare Whiskies",
  "compare.empty": "Nothing to compare yet.",
  "compare.exploreCatalogue": "Explore the Catalogue",
  "compare.addPlaceholder": "Add a whisky — search brand, name or distillery…",
  "compare.addLabel": "Search for a whisky to compare",
  "compare.noMatches": "No matching whisky.",
  "compare.property": "Property",
  "compare.sharedNotesCaption": "which notes overlap",
  "compare.sharedNoteTitle": "Shared by every whisky being compared",
  "compare.subtitle": "Put up to {max} whiskies side by side. Shared aroma notes are highlighted.",
  "compare.emptyHint":
    "Add a whisky from the search box above, or pick one in the catalogue and use its “Compare” button.",
  "compare.addOneMore": "Add at least one more whisky to see which aroma notes they share.",
  "compare.remove": "Remove",
  "compare.tableCaption": "Specification and aroma profile comparison of the selected whiskies",
  "compare.sharedLabel": "shared",
  "compare.brand": "Brand",

  // --- People -------------------------------------------------------------
  "people.title": "People",
  "people.friend": "Friend",
  "people.followsYou": "Follows you",
  "people.searchPlaceholder": "Search people by name…",
  "people.searchLabel": "Search users",
  "people.noMatches": "Nobody matches “{query}”.",
  "people.noUsers": "No other members yet.",
  "people.tryAnotherName": "Try a different name.",
  "people.follow": "Follow",
  "people.unfollow": "Unfollow",
  "people.loginToFollow": "Sign in to follow",
  "people.subtitlePrefix": "Find other whisky enthusiasts and follow them. Anyone you follow who follows you back appears as a",
  "people.subtitleSuffix": ".",
  "people.newMembers": "Newest Members",
  "people.publicNoteCount": "{count} public tastings",
};
