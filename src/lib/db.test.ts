import { describe, it, expect, vi, afterEach } from "vitest";
import { extractDatabaseName, resolveConnectionString } from "./db";

/**
 * Validating the connection string.
 *
 * The rule here was paid for: given a string with no database name, Mongoose
 * does not complain — it quietly writes to a database called "test". That is
 * exactly how the data ended up in the wrong place on the first move to Atlas.
 * These tests keep that silent failure loud.
 */

describe("extractDatabaseName", () => {
  it("extracts the name from a standard string", () => {
    expect(extractDatabaseName("mongodb://localhost:27017/caskkeeper")).toBe("caskkeeper");
  });

  it("strips the query string from an srv string", () => {
    expect(
      extractDatabaseName("mongodb+srv://user:pass@cluster.mongodb.net/caskkeeper?retryWrites=true")
    ).toBe("caskkeeper");
  });

  it("parses a replica set string with several hosts", () => {
    // new URL() throws on this shape, which is why it is parsed by hand.
    expect(
      extractDatabaseName("mongodb://host1:27017,host2:27017,host3:27017/caskkeeper?replicaSet=rs0")
    ).toBe("caskkeeper");
  });

  it("finds the host correctly even with encoded characters in the password", () => {
    expect(extractDatabaseName("mongodb://user:p%40ss@localhost:27017/caskkeeper")).toBe(
      "caskkeeper"
    );
  });

  it("returns empty when there is no name", () => {
    expect(extractDatabaseName("mongodb+srv://user:pass@cluster.mongodb.net")).toBe("");
    expect(extractDatabaseName("mongodb+srv://user:pass@cluster.mongodb.net/")).toBe("");
    expect(extractDatabaseName("mongodb+srv://cluster.mongodb.net/?retryWrites=true")).toBe("");
  });
});

describe("resolveConnectionString", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a valid string unchanged", () => {
    const uri = "mongodb+srv://user:pass@cluster.mongodb.net/caskkeeper?retryWrites=true";
    expect(resolveConnectionString(uri)).toBe(uri);
  });

  it("gives an explanatory error when the variable is not set", () => {
    // The default parameter reads the environment variable, so it is removed
    // temporarily; vitest.config.ts injects a valid value into the test
    // environment.
    vi.stubEnv("MONGODB_URI", "");
    expect(() => resolveConnectionString()).toThrow(/MONGODB_URI/);
    expect(() => resolveConnectionString("")).toThrow(/MONGODB_URI/);
  });

  it("errors on a wrong scheme", () => {
    expect(() => resolveConnectionString("postgres://localhost:5432/db")).toThrow(/mongodb/i);
  });

  it("errors when the database name is missing, and says why", () => {
    expect(() => resolveConnectionString("mongodb+srv://user:pass@cluster.mongodb.net")).toThrow(
      /veritabanı adı içermiyor/
    );
    // The trap of quietly falling back to "test" has to be spelled out in the
    // error text.
    expect(() => resolveConnectionString("mongodb://localhost:27017/")).toThrow(/'test'/);
  });

  it("does not leak the password in the error message", () => {
    let message = "";
    try {
      resolveConnectionString("postgres://admin:sup3rs3cret@db.example.com:5432/x");
    } catch (e) {
      message = e instanceof Error ? e.message : String(e);
    }
    expect(message).not.toContain("sup3rs3cret");
    expect(message).toContain("***");
  });

  it("reads the environment variable when no argument is given", () => {
    // vitest.config.ts injects a valid MONGODB_URI into the test environment.
    expect(resolveConnectionString()).toBe(process.env.MONGODB_URI);
  });
});
