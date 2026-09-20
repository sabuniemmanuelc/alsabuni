// Lightweight i18n manager — applies the `translations` object (see translations.js)
// to any element carrying data-i18n / data-i18n-html, persists the chosen language,
// and switches document direction for RTL languages (Arabic).

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ro", label: "Română" },
  { code: "el", label: "Ελληνικά" },
  { code: "ru", label: "Русский" },
  { code: "af", label: "Afrikaans" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
];
const RTL_LANGS = ["ar"];

class I18nManager {
  constructor() {
    const stored = localStorage.getItem("preferred-language");
    const supported = LANGS.map((l) => l.code);
    this.currentLang = supported.includes(stored) ? stored : "en";
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.en;
    return dict[key] || translations.en[key] || key;
  }

  init() {
    this.populateSwitchers();
    this.apply(this.currentLang);
    document.querySelectorAll(".lang-select").forEach((sel) => {
      sel.addEventListener("change", (e) => this.switchLanguage(e.target.value));
    });
  }

  populateSwitchers() {
    document.querySelectorAll(".lang-select").forEach((sel) => {
      sel.innerHTML = LANGS.map(
        (l) => `<option value="${l.code}">${l.label}</option>`
      ).join("");
      sel.value = this.currentLang;
    });
  }

  switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("preferred-language", lang);
    document.querySelectorAll(".lang-select").forEach((sel) => {
      sel.value = lang;
    });
    this.apply(lang);
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(lang);
    }
  }

  apply(lang) {
    const isRTL = RTL_LANGS.includes(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.classList.toggle("rtl-lang", isRTL);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = this.t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = this.t(key);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  window.i18n = new I18nManager();
  window.i18n.init();
});
