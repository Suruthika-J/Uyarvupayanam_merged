/**
 * Unit tests for externalUrl.js — run with: npm test
 * Uses Node's built-in test runner (no dependency required).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toExternalUrl } from "./externalUrl.js";

describe("toExternalUrl", () => {
  it("leaves absolute https URLs completely untouched", () => {
    assert.equal(toExternalUrl("https://www.apachc.in/"), "https://www.apachc.in/");
    assert.equal(toExternalUrl("https://www.via.ac.in"), "https://www.via.ac.in");
  });

  it("leaves plain http URLs untouched so working links are not broken", () => {
    assert.equal(toExternalUrl("http://gaccbe.ac.in/"), "http://gaccbe.ac.in/");
    assert.equal(toExternalUrl("http://example.com"), "http://example.com");
  });

  it("upgrades a scheme-less host so it is external, not relative", () => {
    // The reported bug: "www.apahc.in" resolved to
    // "/student/colleges/www.apahc.in".
    assert.equal(toExternalUrl("www.apahc.in"), "https://www.apahc.in");
    assert.equal(toExternalUrl("www.via.ac.in"), "https://www.via.ac.in");
    assert.equal(toExternalUrl("example.edu"), "https://example.edu");
  });

  it("keeps any path, query or fragment on a scheme-less value", () => {
    assert.equal(
      toExternalUrl("example.edu/admissions?year=2026#apply"),
      "https://example.edu/admissions?year=2026#apply",
    );
  });

  it("fills in the scheme for protocol-relative URLs", () => {
    assert.equal(toExternalUrl("//www.example.com"), "https://www.example.com");
  });

  it("preserves other real schemes verbatim", () => {
    assert.equal(
      toExternalUrl("mailto:admissions@via.ac.in"),
      "mailto:admissions@via.ac.in",
    );
    assert.equal(toExternalUrl("tel:+914423445678"), "tel:+914423445678");
  });

  it("refuses to link unsafe schemes", () => {
    assert.equal(toExternalUrl("javascript:alert(1)"), "");
    assert.equal(toExternalUrl("JavaScript:alert(1)"), "");
    assert.equal(toExternalUrl("data:text/html,<script>alert(1)</script>"), "");
    assert.equal(toExternalUrl("vbscript:msgbox(1)"), "");
    assert.equal(toExternalUrl("file:///etc/passwd"), "");
  });

  it("returns empty string for missing or blank values", () => {
    assert.equal(toExternalUrl(""), "");
    assert.equal(toExternalUrl("   "), "");
    assert.equal(toExternalUrl(null), "");
    assert.equal(toExternalUrl(undefined), "");
  });

  it("trims surrounding whitespace before deciding", () => {
    assert.equal(toExternalUrl("  www.example.com  "), "https://www.example.com");
  });

  it("never leaves the result relative", () => {
    const stored = [
      "www.apahc.in",
      "www.via.ac.in",
      "https://ok.example.com",
      "http://old.example.com",
      "//proto.example.com",
      "example.com",
    ];
    for (const value of stored) {
      assert.match(toExternalUrl(value), /^[a-z][a-z0-9+.-]*:\/\//i);
    }
  });
});