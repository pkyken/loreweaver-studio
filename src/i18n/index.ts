import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import ja from "./locales/ja.json"
import zh from "./locales/zh.json"

const STORAGE_KEY = "lw-lang"

type SupportedLanguage = "en" | "ja" | "zh"

export const resources = {
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
} as const

/** Resolve the startup locale. `navigator.language` is optional — bun's test
 * runner (and some embedded WebViews) expose `navigator` without it. */
export function detectLanguage(
  stored: string | null | undefined,
  navigatorLanguage: string | null | undefined,
): SupportedLanguage {
  if (stored === "en" || stored === "ja" || stored === "zh") return stored
  const nav = typeof navigatorLanguage === "string" ? navigatorLanguage.toLowerCase() : ""
  if (nav.startsWith("ja")) return "ja"
  if (nav.startsWith("zh")) return "zh"
  return "en"
}

function initialLanguage(): string {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
  const navLang =
    typeof navigator !== "undefined" && typeof navigator.language === "string"
      ? navigator.language
      : undefined
  return detectLanguage(stored, navLang)
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

i18n.on("languageChanged", (lng) => {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, lng)
})

export default i18n
