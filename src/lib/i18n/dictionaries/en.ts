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
  "offline.syncFailed": "Could not refresh your data.",
  "offline.cardDescription":
    "Turn this on and your tasting notes and wishlist are saved to this device and kept current, so you can read them with no connection. Turn it off and the stored copy is deleted at once.",
  "offline.unsupported": "This browser cannot store data for offline use.",
  "offline.syncNow": "Refresh now",
  "offline.syncing": "Refreshing…",
  "offline.lastSync": "Last synced:",
  "offline.counts": "{notes} tasting notes, {wishlist} wishlist entries",
  "offline.noData": "Nothing is stored on this device.",
  "offline.loading": "Loading…",
  "offline.noDataTitle": "No offline data",
  "offline.noDataBody":
    "Nothing has been downloaded to this device yet. While you are online, use the “Download my data” switch on your dashboard to save your tasting notes and wishlist.",
  "offline.goToDashboard": "Go to the dashboard",
  "offline.copyOwner": "{name}'s copy on this device · last synced {date}",
  "offline.backOnline": "You are back online — return to the dashboard",
  "offline.tabNotes": "My Tastings ({count})",
  "offline.tabWishlist": "My Wishlist ({count})",
  "offline.noNotes": "No tasting notes stored.",
  "offline.emptyWishlist": "Your wishlist is empty.",

  // --- Profile form -------------------------------------------------------
  "profileForm.bioMax": "Your bio can be at most 500 characters",
  "profileForm.urlInvalid": "Enter a valid URL",
  "profileForm.failed": "Could not update your profile",
  "profileForm.emailFixed": "Your email address cannot be changed.",
  "profileForm.bio": "About me",
  "profileForm.bioPlaceholder": "Say a little about your whisky journey…",
  "profileForm.picture": "Profile Picture (URL)",
  "profileForm.saved": "Your profile has been updated.",
  "profileForm.save": "Save",

  // --- Flavour picker -----------------------------------------------------
  "flavorPicker.removeHint": "Click to remove",

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
  "common.previous": "Previous",
  "common.next": "Next",
  "common.pageOf": "Page",
  "common.searching": "Searching…",
  "common.offline": "Offline",

  // --- Relative time ------------------------------------------------------
  "time.justNow": "just now",
  "time.minutesAgo": "{count} min ago",
  "time.hoursAgo": "{count} h ago",
  "time.daysAgo": "{count} d ago",
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
  "catalogue.clearFilters": "Clear the filters and try again.",
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
  "compare.full": "You can compare up to {max} whiskies. Remove one to add another.",
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

  // --- Social lists -------------------------------------------------------
  "social.backToProfile": "Back to {name}'s profile",
  "social.followersTitle": "Followers",
  "social.followersHeading": "{name} — Followers ({count})",
  "social.followingTitle": "Following",
  "social.followingHeading": "{name} — Following ({count})",
  "social.noFollowers": "No followers yet.",
  "social.noFollowing": "Not following anyone yet.",

  // --- Tasting note permalink ---------------------------------------------
  "notePage.fallbackTitle": "Tasting note",
  "notePage.fallbackAuthor": "Tasting",
  "notePage.notFound": "Tasting Note Not Found",

  // --- Recommendation match -----------------------------------------------
  "match.percent": "{percent}% match",

  // --- Aroma trend --------------------------------------------------------
  "trend.empty":
    "As you tag aromas in your tasting notes, the shift over time will show up here.",
  "trend.barLabel": "{period}: {count} aroma tags",
  "trend.showTable": "Table view",
  "trend.hideTable": "Hide the table",

  // --- Tasting note card --------------------------------------------------
  "note.public": "Public",
  "note.finishShort": "Short finish",
  "note.finishMedium": "Medium finish",
  "note.finishLong": "Long finish",
  "note.finishPrefix": "Finish",
  "note.favoriteAdd": "Add to favourites",
  "note.favoriteRemove": "Remove from favourites",
  "note.edit": "Edit",
  "note.delete": "Delete",
  "note.deleteConfirm": "Click again to confirm deletion",

  // --- Likes and comments -------------------------------------------------
  "interactions.likeFailed": "Could not update the like",
  "interactions.like": "Like",
  "interactions.unlike": "Unlike",
  "interactions.likeSignIn": "Sign in to like this",
  "interactions.likeUnit": "likes",
  "interactions.showComments": "Show comments",
  "interactions.hideComments": "Hide comments",
  "interactions.openNote": "Open the note",
  "interactions.loadingComments": "Loading comments…",
  "interactions.noComments": "No comments yet. Be the first.",
  "interactions.commentPlaceholder": "What did you make of this dram?",
  "interactions.send": "Send",
  "interactions.signInToCommentBefore": "To leave a comment,",
  "interactions.signInToCommentLink": "sign in",

  // --- Notifications ------------------------------------------------------
  "notifications.title": "Notifications",
  "notifications.unreadCount": "You have {count} unread notifications.",
  "notifications.allRead": "You are all caught up.",
  "notifications.empty": "No notifications yet.",
  "notifications.emptyHint":
    "When somebody follows you, or likes or comments on a tasting, it shows up here.",
  "notifications.markAllRead": "Mark all as read",
  "notifications.unread": "Unread",
  "notifications.bellWithCount": "Notifications — {count} unread",
  "notifications.targetNamed": "your “{whiskey}” tasting",
  "notifications.targetGeneric": "your tasting note",
  "notifications.follow": "started following you",
  "notifications.like": "liked {target}",
  "notifications.comment": "commented on {target}",

  // --- Dashboard ----------------------------------------------------------
  "dashboard.title": "My Dashboard",
  "dashboard.welcome": "Welcome,",
  "dashboard.subtitle": "Here is your tasting journey so far.",
  "dashboard.startTasting": "Start a New Tasting",
  "dashboard.statTotal": "Total Tastings",
  "dashboard.statDistinct": "Distinct Whiskies",
  "dashboard.statAverage": "Average Score",
  "dashboard.statFavorites": "Favourite Tastings",
  "dashboard.recentTastings": "Your Recent Tastings",
  "dashboard.noNotes": "No tasting notes yet.",
  "dashboard.noNotesHintBefore": "Pick a whisky from the catalogue",
  "dashboard.noNotesHintAfter": "and write your first note.",
  "dashboard.palateProfile": "Your Palate Profile",
  "dashboard.topFlavors": "The Aromas You Pick Most",
  "dashboard.noFlavors":
    "As you tag aromas in your tasting notes, your palate profile will take shape here.",
  "dashboard.detailedStats": "Detailed Statistics",
  "dashboard.recommendations": "Recommended for You",
  "dashboard.back": "Back to my dashboard",

  // --- Admin --------------------------------------------------------------
  "admin.title": "Admin",
  "admin.catalogue": "Catalogue",
  "admin.users": "Users",
  "admin.catalogueTitle": "Catalogue Management",
  "admin.usersTitle": "User Management",
  "admin.usersSubtitleBefore": "There are",
  "admin.usersSubtitleAfter":
    "users. Anyone you make an administrator can edit the catalogue.",
  "admin.roleAdmin": "Administrator",
  "admin.roleGrant": "Make Administrator",
  "admin.roleRevoke": "Revoke Rights",
  "admin.roleFailed": "Could not change the role",
  "admin.ownAccount": "Your own account",
  "admin.emptyCatalogue": "The catalogue is empty.",
  "admin.emptyCatalogueHint": "Add a whisky, or run the import script.",
  "admin.newWhiskeyTitle": "Add a Whisky to the Catalogue",
  "admin.newWhiskeyHint": "The slug is generated from brand, product name and distillery.",
  "admin.editWhiskeyTitle": "Edit Whisky",
  "admin.editWhiskeyHint":
    "Changing the brand, product name or distillery regenerates the slug.",
  "admin.deleteConfirm": "“{label}” will be deleted — click again to confirm",
  "whiskeyForm.identityCard": "Identity",
  "whiskeyForm.brand": "Brand *",
  "whiskeyForm.name": "Product Name *",
  "whiskeyForm.distillery": "Distillery *",
  "whiskeyForm.distilleryHint":
    "If you do not know it, use the producer — it is part of the identity and cannot be blank.",
  "whiskeyForm.externalId": "External ID (externalId)",
  "whiskeyForm.externalIdHint":
    "A stable identifier — it prevents duplicates if you correct a name later.",
  "whiskeyForm.classificationCard": "Classification",
  "whiskeyForm.region": "Region *",
  "whiskeyForm.country": "Country *",
  "whiskeyForm.subRegion": "Sub-region",
  "whiskeyForm.abv": "ABV (%) *",
  "whiskeyForm.age": "Age (years)",
  "whiskeyForm.caskType": "Cask Type",
  "whiskeyForm.bottlingYear": "Bottling Year",
  "whiskeyForm.vintage": "Vintage",
  "whiskeyForm.limitedEdition": "Limited Edition",
  "whiskeyForm.contentCard": "Content",
  "whiskeyForm.description": "Description",
  "whiskeyForm.flavorProfile": "Flavour Profile",
  "whiskeyForm.tags": "Tags",
  "whiskeyForm.awards": "Awards",
  "whiskeyForm.imageUrl": "Image URL",
  "whiskeyForm.officialUrl": "Official Page URL",
  "whiskeyForm.commaHint": "Separate with commas.",
  "whiskeyForm.cancel": "Cancel",
  "whiskeyForm.create": "Add to the Catalogue",
  "whiskeyForm.saveChanges": "Save Changes",
  "whiskeyForm.brandMin": "The brand must be at least 2 characters",
  "whiskeyForm.nameMin": "The product name must be at least 2 characters",
  "whiskeyForm.distilleryRequired": "A distillery is required",
  "whiskeyForm.regionRequired": "A region is required",
  "whiskeyForm.countryRequired": "A country is required",
  "whiskeyForm.abvRange": "Must be between 0 and 100",
  "whiskeyForm.typeRequired": "A type is required",

  // --- Statistics ---------------------------------------------------------
  "stats.title": "Detailed Statistics",
  "stats.subtitle": "How your palate shifts over time, and what you reach for in the catalogue.",
  "stats.trendTitle": "Aroma Shift Over Time",
  "stats.byType": "By Type",
  "stats.byRegion": "By Region",
  "stats.topDistilleries": "Most Tasted Distilleries",
  "stats.empty": "No tasting notes yet.",

  // --- Tasting note form --------------------------------------------------
  "noteForm.newTitle": "New Tasting Note",
  "noteForm.editTitle": "Edit Tasting Note",
  "noteForm.backToWhiskey": "Back to the Whisky",
  "noteForm.backToTastings": "Back to My Tastings",
  "noteForm.sessionCard": "Tasting Session",
  "noteForm.date": "Tasting Date",
  "noteForm.rating": "Score:",
  "noteForm.noseCard": "Nose",
  "noteForm.nose": "Nose",
  "noteForm.noseNotes": "Your Nose Notes",
  "noteForm.nosePlaceholder": "What do you get as you bring the glass to your nose?",
  "noteForm.palateCard": "Palate",
  "noteForm.palate": "Palate",
  "noteForm.palateNotes": "Your Palate Notes",
  "noteForm.palatePlaceholder": "Which flavours come forward on the first sip?",
  "noteForm.finishCard": "Finish",
  "noteForm.finish": "Finish",
  "noteForm.finishLength": "Finish Length",
  "noteForm.finishNotes": "Your Finish Notes",
  "noteForm.finishPlaceholder": "What lingers after you swallow?",
  "noteForm.personalCard": "Personal Notes",
  "noteForm.personalNotes": "Your Memories and Thoughts",
  "noteForm.personalPlaceholder": "What made this dram special? Where were you, and who with?",
  "noteForm.visibility": "Visibility",
  "noteForm.visibilityPrivate": "Private (only me)",
  "noteForm.visibilityPublic": "Public",
  "noteForm.favorite": "Favourite",
  "noteForm.cancel": "Cancel",
  "noteForm.save": "Save Tasting Note",
  "noteForm.saveChanges": "Save Changes",
  "noteForm.failed": "Could not save the tasting note",
  "noteForm.dateRequired": "A tasting date is required",
  "noteForm.ratingRange": "The score must be between 0 and 100",
  "noteForm.finishRequired": "Choose a finish length",
  "noteForm.maxChars": "At most {max} characters",

  // --- Recommendations ----------------------------------------------------
  "recommendations.title": "Recommendations",
  "recommendations.subtitle":
    "Whiskies you have not tried yet, ranked by the aromas you reach for most.",
  "recommendations.empty": "We cannot suggest anything for you yet.",
  "recommendations.emptyHint":
    "As you tag aromas in your tasting notes, your palate profile builds up and recommendations appear here.",

  // --- Profile ------------------------------------------------------------
  "profile.title": "My Profile",
  "profile.memberSince": "Member since {date}",
  "profile.infoTitle": "Profile Details",
  "profile.infoDescription": "Update your name, your bio and your profile picture.",
  "profile.notFound": "User Not Found",
  "profile.statTastings": "Tastings",
  "profile.statFollowers": "Followers",
  "profile.statFollowing": "Following",
  "profile.edit": "Edit profile",
  "profile.publicTastings": "Public Tastings",
  "profile.noPublicOwn": "You have no public tastings yet.",
  "profile.noPublicOther": "This member has no public tastings yet.",
  "profile.noPublicHint":
    "Mark a tasting note as “Public” and it will show up here.",

  // --- Wishlist -----------------------------------------------------------
  "wishlist.title": "My Wishlist",
  "wishlist.count": "{count} whiskies you mean to try.",
  "wishlist.subtitle": "Collect the whiskies you mean to try here.",
  "wishlist.empty": "Your wishlist is still empty.",
  "wishlist.emptyHint":
    "When you find a whisky you want to try, add it from its detail page.",

  // --- Favourites ---------------------------------------------------------
  "favorites.title": "My Favourites",
  "favorites.count": "You have {count} favourite tastings.",
  "favorites.subtitle": "No favourite tastings yet.",
  "favorites.empty": "Your favourite tastings will appear here.",
  "favorites.emptyHintBefore": "From your tastings,",
  "favorites.emptyHintAfter": "tap the heart to add one to your favourites.",

  // --- My tastings --------------------------------------------------------
  "myTastings.title": "My Tastings",
  "myTastings.count": "You have recorded {count} tasting sessions.",
  "myTastings.subtitle": "No tasting notes yet.",
  "myTastings.new": "New Tasting",
  "myTastings.empty": "Your journal is waiting.",
  "myTastings.emptyHintBefore": "Pick a whisky from the catalogue",
  "myTastings.emptyHintAfter": "and write your first tasting note.",

  // --- Feed ---------------------------------------------------------------
  "feed.title": "Feed",
  "feed.subtitle": "The newest public tastings from the people you follow.",
  "feed.empty": "Your feed is still empty.",
  "feed.emptyHint":
    "Follow other enthusiasts to see their public tastings here.",
  "feed.discoverPeople": "Discover People",

  // --- Home page ----------------------------------------------------------
  "home.eyebrow": "A Premium Whisky Tasting Journal",
  "home.headlineBefore": "Every sip",
  "home.headlineHighlight": "a memory",
  "home.headlineAfter": ", every bottle a story.",
  "home.subtitle":
    "Discover whiskies with CaskKeeper, keep your tastings in an elegant journal, and follow where your palate takes you.",
  "home.ctaDashboard": "Go to My Dashboard",
  "home.ctaCatalogue": "Browse the Catalogue",
  "home.ctaSignUp": "Start for Free",

  "home.feature.discover.title": "Discover",
  "home.feature.discover.body":
    "Search one central catalogue of whiskies from around the world by brand, region and type.",
  "home.feature.record.title": "Record",
  "home.feature.record.body":
    "Capture every session with nose, palate and finish notes, and aroma tags picked from a flavour wheel.",
  "home.feature.compare.title": "Compare",
  "home.feature.compare.body":
    "Put your tastings of the same whisky side by side over time and watch your palate evolve.",
  "home.feature.favorite.title": "Favourite",
  "home.feature.favorite.body":
    "Mark the drams you loved most and build your own whisky memory.",
  "people.publicNoteCount": "{count} public tastings",
};
