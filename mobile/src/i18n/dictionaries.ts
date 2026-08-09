/**
 * @file dictionaries.ts
 * @description Arayüz metinleri — Türkçe kaynak dil, İngilizce karşılığı.
 *
 * Web tarafındaki desenin aynısı: düz anahtar-değer sözlük, kütüphane yok.
 * `en`'in tipi `tr`'den türüyor, yani eksik ya da fazla anahtar DERLEME
 * HATASI verir; çeviri sessizce geride kalamaz.
 *
 * Neden ilk günden: web'de çeviriyi sonradan eklemek altı PR sürdü (#18–#23),
 * çünkü metinler bileşenlerin içine gömülmüştü. Burada anahtar sayısı henüz
 * az; alışkanlığı baştan kurmak bedavaya geliyor.
 */

export const tr = {
  "auth.signInTitle": "Tekrar Hoş Geldiniz",
  "auth.signInSubtitle": "Tadım günlüğünüze devam edin.",
  "auth.signUpTitle": "Günlüğünüzü Başlatın",
  "auth.signUpSubtitle": "Ücretsiz hesap oluşturun.",
  "auth.email": "E-posta",
  "auth.password": "Parola",
  "auth.name": "İsim",
  "auth.signIn": "Giriş Yap",
  "auth.signUp": "Hesap Oluştur",
  "auth.noAccount": "Hesabınız yok mu? Kayıt olun",
  "auth.hasAccount": "Zaten hesabınız var mı? Giriş yapın",
  "auth.signInFailed": "Giriş yapılamadı",
  "auth.signUpFailed": "Kayıt oluşturulamadı",

  "home.greeting": "Hoş geldiniz, {name}",
  "home.placeholder": "Ekranlar sıradaki dilimde geliyor.",
  "home.signOut": "Çıkış Yap",

  "error.network": "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
  "error.unexpected": "Beklenmeyen bir hata oluştu.",

  "common.loading": "Yükleniyor…",
} as const;

export type TranslationKey = keyof typeof tr;

export const en: Record<TranslationKey, string> = {
  "auth.signInTitle": "Welcome Back",
  "auth.signInSubtitle": "Pick up your tasting journal.",
  "auth.signUpTitle": "Start Your Journal",
  "auth.signUpSubtitle": "Create a free account.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.signIn": "Sign In",
  "auth.signUp": "Create Account",
  "auth.noAccount": "No account yet? Sign up",
  "auth.hasAccount": "Already have an account? Sign in",
  "auth.signInFailed": "Could not sign in",
  "auth.signUpFailed": "Could not sign up",

  "home.greeting": "Welcome, {name}",
  "home.placeholder": "Screens arrive in the next slice.",
  "home.signOut": "Sign Out",

  "error.network": "Could not reach the server. Check your connection.",
  "error.unexpected": "An unexpected error occurred.",

  "common.loading": "Loading…",
};
