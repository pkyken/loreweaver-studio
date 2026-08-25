import { describe, expect, it } from "vitest"
import { detectLanguage } from "./index"
import en from "./locales/en.json"
import ja from "./locales/ja.json"
import zh from "./locales/zh.json"

const STUDIO_SOURCES: Record<string, string> = import.meta.glob("../features/studio/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
})

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
}

describe("detectLanguage", () => {
  it("prefers a stored locale over the navigator", () => {
    expect(detectLanguage("zh", "en-US")).toBe("zh")
    expect(detectLanguage("ja", "en-US")).toBe("ja")
    expect(detectLanguage("en", "ja-JP")).toBe("en")
  })

  it("treats a missing navigator language as English", () => {
    expect(detectLanguage(null, undefined)).toBe("en")
    expect(detectLanguage(null, null)).toBe("en")
  })

  it("maps Japanese navigator locales to ja", () => {
    expect(detectLanguage(null, "ja-JP")).toBe("ja")
    expect(detectLanguage(null, "ja")).toBe("ja")
  })

  it("maps Chinese navigator locales to zh", () => {
    expect(detectLanguage(null, "zh-CN")).toBe("zh")
    expect(detectLanguage(null, "zh")).toBe("zh")
  })
})

describe("locale resources", () => {
  it("en and zh declare exactly the same key set", () => {
    expect(keyPaths(zh).sort()).toEqual(keyPaths(en).sort())
  })

  it("Japanese translations only use keys defined by English", () => {
    const englishKeys = new Set(keyPaths(en))
    expect(keyPaths(ja).filter((key) => !englishKeys.has(key)).sort()).toEqual([])
  })

  it("no locale value is empty", () => {
    for (const locale of [en, ja, zh]) {
      expect(keyPaths(locale).length).toBeGreaterThan(0)
      expect(JSON.stringify(locale)).not.toContain('""')
    }
  })

  it("every Issue key a reader can emit has a message under studio.pack.err", () => {
    const messages = new Set([
      ...Object.keys(en.studio.err),
      ...Object.keys(en.studio.pack.err),
      ...Object.keys(en.studio.panels.problem),
    ])
    const emitted = new Set<string>()
    for (const [path, text] of Object.entries(STUDIO_SOURCES)) {
      if (/\.test\.tsx?$/.test(path)) continue
      for (const match of text.matchAll(/\{\s*key:\s*"([A-Za-z0-9_]+)"\s*(?:\}|,\s*params:)/g)) {
        emitted.add(match[1])
      }
    }
    expect(emitted.size).toBeGreaterThan(20)
    expect([...emitted].filter((key) => !messages.has(key)).sort()).toEqual([])
  })
})
