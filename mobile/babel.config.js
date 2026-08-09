/**
 * Expo Router'ın istediği Babel yapılandırması.
 *
 * `babel-preset-expo` package.json'da BAĞIMLILIK olarak durmalı — bu dosya onu
 * adıyla çağırıyor. Eksik olduğunda ne test ne tip denetimi ne de expo-doctor
 * ses çıkarıyor; yalnızca Metro paketlemeye çalışırken çöküyor
 * ("Failed to construct transformer"), yani hata ancak uygulama açılmak
 * üzereyken görünüyor.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
