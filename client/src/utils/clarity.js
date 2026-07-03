const CLARITY_VALUE_LIMIT = 120;
const SENSITIVE_URL_PARAM_NAMES = new Set([
  "access_token",
  "code",
  "email",
  "id_token",
  "password",
  "session_id",
  "token",
  "username",
]);
const upgradedReasons = new Set();

export const normalizeClarityValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeClarityValue(item));
  }

  return (
    String(value ?? "unknown")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, CLARITY_VALUE_LIMIT) || "unknown"
  );
};

export const normalizeClarityEventName = (value) =>
  normalizeClarityValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "unknown_event";

export const sanitizeClarityPath = (value) => {
  const path = normalizeClarityValue(value);

  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://example.invalid";
    const url = new URL(path, base);

    Array.from(url.searchParams.keys()).forEach((key) => {
      if (SENSITIVE_URL_PARAM_NAMES.has(key.toLowerCase())) {
        url.searchParams.set(key, "redacted");
      }
    });

    const hash = SENSITIVE_URL_PARAM_NAMES.has(
      url.hash.replace(/^#/, "").split("=")[0]?.toLowerCase(),
    )
      ? "#redacted"
      : url.hash;

    return normalizeClarityValue(`${url.pathname}${url.search}${hash}`);
  } catch {
    return path.replace(
      /(code|email|password|session_id|token|username)=([^&#]+)/gi,
      "$1=redacted",
    );
  }
};

const canUseClarity = () =>
  typeof window !== "undefined" && typeof window.clarity === "function";

const callClarity = (command, ...args) => {
  if (!canUseClarity()) return false;

  window.clarity(command, ...args);
  return true;
};

export const setClarityTag = (key, value) => {
  const tagKey = normalizeClarityValue(key);
  if (!tagKey || tagKey === "unknown") return false;

  return callClarity("set", tagKey, normalizeClarityValue(value));
};

export const upgradeClaritySession = (reason) => {
  const normalizedReason = normalizeClarityValue(reason);
  if (!normalizedReason || normalizedReason === "unknown") return false;
  if (upgradedReasons.has(normalizedReason)) return false;

  upgradedReasons.add(normalizedReason);
  return callClarity("upgrade", normalizedReason);
};

export const trackClarityEvent = (eventName, tags = {}, upgradeReason) => {
  const normalizedEventName = normalizeClarityEventName(eventName);

  Object.entries({
    ...tags,
    clarity_last_event: normalizedEventName,
  }).forEach(([key, value]) => {
    setClarityTag(key, value);
  });

  const tracked = callClarity("event", normalizedEventName);

  if (upgradeReason) {
    upgradeClaritySession(upgradeReason);
  }

  return tracked;
};
