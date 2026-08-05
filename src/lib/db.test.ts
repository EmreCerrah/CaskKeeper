import { describe, it, expect, vi, afterEach } from "vitest";
import { extractDatabaseName, resolveConnectionString } from "./db";

/**
 * Bağlantı dizesi doğrulaması.
 *
 * Buradaki kuralın bir maliyeti var: veritabanı adı olmayan bir dizeyle Mongoose
 * hata vermez, sessizce "test" veritabanına yazar. Atlas'a ilk geçişte veriler
 * tam bu yüzden yanlış yere gitti. Testler o sessiz hatayı gürültülü tutuyor.
 */

describe("extractDatabaseName", () => {
  it("standart dizeden adı çıkarır", () => {
    expect(extractDatabaseName("mongodb://localhost:27017/caskkeeper")).toBe("caskkeeper");
  });

  it("srv dizesinden query string'i ayıklar", () => {
    expect(
      extractDatabaseName("mongodb+srv://user:pass@cluster.mongodb.net/caskkeeper?retryWrites=true")
    ).toBe("caskkeeper");
  });

  it("replica set (çok host'lu) dizeyi ayrıştırır", () => {
    // new URL() bu biçimde hata fırlatıyor; bu yüzden elle ayrıştırıyoruz.
    expect(
      extractDatabaseName("mongodb://host1:27017,host2:27017,host3:27017/caskkeeper?replicaSet=rs0")
    ).toBe("caskkeeper");
  });

  it("parolada kodlanmış karakter olsa da host'u doğru bulur", () => {
    expect(extractDatabaseName("mongodb://user:p%40ss@localhost:27017/caskkeeper")).toBe(
      "caskkeeper"
    );
  });

  it("ad yoksa boş döner", () => {
    expect(extractDatabaseName("mongodb+srv://user:pass@cluster.mongodb.net")).toBe("");
    expect(extractDatabaseName("mongodb+srv://user:pass@cluster.mongodb.net/")).toBe("");
    expect(extractDatabaseName("mongodb+srv://cluster.mongodb.net/?retryWrites=true")).toBe("");
  });
});

describe("resolveConnectionString", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("geçerli dizeyi olduğu gibi döndürür", () => {
    const uri = "mongodb+srv://user:pass@cluster.mongodb.net/caskkeeper?retryWrites=true";
    expect(resolveConnectionString(uri)).toBe(uri);
  });

  it("değişken tanımlı değilse açıklayıcı hata verir", () => {
    // Varsayılan parametre ortam değişkenini okuduğu için onu geçici kaldırıyoruz;
    // test ortamına vitest.config.ts geçerli bir değer enjekte ediyor.
    vi.stubEnv("MONGODB_URI", "");
    expect(() => resolveConnectionString()).toThrow(/MONGODB_URI/);
    expect(() => resolveConnectionString("")).toThrow(/MONGODB_URI/);
  });

  it("şema yanlışsa hata verir", () => {
    expect(() => resolveConnectionString("postgres://localhost:5432/db")).toThrow(/mongodb/i);
  });

  it("veritabanı adı yoksa hata verir ve nedenini söyler", () => {
    expect(() => resolveConnectionString("mongodb+srv://user:pass@cluster.mongodb.net")).toThrow(
      /veritabanı adı içermiyor/
    );
    // "test"e sessizce düşme tuzağı hata metninde açıkça anlatılmalı.
    expect(() => resolveConnectionString("mongodb://localhost:27017/")).toThrow(/'test'/);
  });

  it("hata mesajında parolayı sızdırmaz", () => {
    let message = "";
    try {
      resolveConnectionString("postgres://admin:sup3rs3cret@db.example.com:5432/x");
    } catch (e) {
      message = e instanceof Error ? e.message : String(e);
    }
    expect(message).not.toContain("sup3rs3cret");
    expect(message).toContain("***");
  });

  it("argüman verilmezse ortam değişkenini okur", () => {
    // vitest.config.ts test ortamına geçerli bir MONGODB_URI enjekte ediyor.
    expect(resolveConnectionString()).toBe(process.env.MONGODB_URI);
  });
});
