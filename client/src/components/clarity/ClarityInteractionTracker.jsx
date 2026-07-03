import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import {
  normalizeClarityEventName,
  normalizeClarityValue,
  sanitizeClarityPath,
  trackClarityEvent,
} from "../../utils/clarity";

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "area[href]",
  "summary",
  "label",
  "select",
  "textarea",
  "input:not([type='hidden'])",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='switch']",
  "[data-clarity-click]",
  "[data-clarity-event]",
].join(", ");

const DISABLED_SELECTOR = [
  "button:disabled",
  "input:disabled",
  "select:disabled",
  "textarea:disabled",
  "[disabled]",
  "[aria-disabled='true']",
].join(", ");

const FORM_FIELD_TAGS = new Set(["input", "select", "textarea"]);
const VALUE_LABEL_INPUT_TYPES = new Set(["button", "submit", "reset", "image"]);

const RAGE_CLICK_COUNT = 3;
const RAGE_CLICK_WINDOW_MS = 1600;
const DEAD_CLICK_CHECK_MS = 900;
const QUICK_BACK_WINDOW_MS = 5000;
const EXCESSIVE_SCROLL_WINDOW_MS = 6500;
const EXCESSIVE_SCROLL_VIEWPORTS = 5;
const MIN_SCROLLABLE_HEIGHT = 16;
const STRICT_MODE_DUPLICATE_MS = 1000;
const SCROLL_DEPTH_MARKS = [25, 50, 75, 90, 100];

const hashValue = (value) => {
  const normalizedValue = normalizeClarityValue(value);
  let hash = 0;

  for (let index = 0; index < normalizedValue.length; index += 1) {
    hash = (hash * 31 + normalizedValue.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
};

const normalizeKeyPart = (value) =>
  normalizeClarityValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || `u_${hashValue(value)}`;

const getClosest = (target, selector) => {
  if (!target || typeof target.closest !== "function") return null;
  return target.closest(selector);
};

const getInputType = (element) =>
  normalizeClarityValue(element.getAttribute("type") || element.type || "text")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "") || "text";

const getAssociatedLabel = (element) => {
  if (!element.labels?.length) return null;

  const labels = Array.from(element.labels)
    .map((label) => label.innerText || label.textContent)
    .filter(Boolean);

  return labels[0] || null;
};

const getElementLabel = (element) => {
  const tagName = element.tagName.toLowerCase();
  const inputType = tagName === "input" ? getInputType(element) : null;
  const safeInputValue =
    inputType && VALUE_LABEL_INPUT_TYPES.has(inputType)
      ? element.getAttribute("value")
      : null;

  return normalizeClarityValue(
    element.getAttribute("data-clarity-label") ||
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      safeInputValue ||
      getAssociatedLabel(element) ||
      element.getAttribute("placeholder") ||
      element.innerText ||
      element.textContent ||
      element.name ||
      element.id ||
      element.getAttribute("href") ||
      inputType ||
      element.tagName,
  );
};

const getElementKind = (element) => {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  if (tagName === "a" || tagName === "area" || role === "link") return "link";
  if (tagName === "input") return `input_${getInputType(element)}`;
  if (tagName === "select" || tagName === "textarea") return tagName;
  if (role) return `role_${normalizeKeyPart(role)}`;
  if (tagName === "summary" || tagName === "label") return tagName;

  return "button";
};

const getElementDetails = (element, pagePath) => {
  const label = getElementLabel(element);
  const kind = getElementKind(element);
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${normalizeKeyPart(element.id)}` : "";

  return {
    clarity_page_path: pagePath,
    clarity_element_kind: kind,
    clarity_element_label: label,
    clarity_element_tag: tagName,
    clarity_element_signature: `${tagName}${id}_${normalizeKeyPart(label)}`,
  };
};

const getInteractionEventName = (details) => {
  if (details.clarity_element_kind === "link") return "site_link_click";

  if (
    details.clarity_element_tag &&
    FORM_FIELD_TAGS.has(details.clarity_element_tag)
  ) {
    return "site_form_interaction";
  }

  return "site_button_click";
};

const getCustomEventName = (element) => {
  const eventName = element.getAttribute("data-clarity-event");
  return eventName ? normalizeClarityEventName(eventName) : null;
};

const getDocumentHeight = () =>
  Math.max(
    document.body?.scrollHeight || 0,
    document.documentElement?.scrollHeight || 0,
    document.body?.offsetHeight || 0,
    document.documentElement?.offsetHeight || 0,
  );

const ClarityInteractionTracker = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const clickHistoryRef = useRef(new Map());
  const routeHistoryRef = useRef([]);
  const lastPageViewRef = useRef(null);
  const pendingDeadClickChecksRef = useRef(new Set());

  const pagePath = useMemo(
    () =>
      sanitizeClarityPath(
        `${location.pathname}${location.search}${location.hash}`,
      ),
    [location.hash, location.pathname, location.search],
  );

  const sendClarityEvent = useCallback(
    (eventName, tags = {}, upgradeReason) => {
      trackClarityEvent(eventName, tags, upgradeReason);
    },
    [],
  );

  useEffect(() => {
    const now = Date.now();
    const lastPageView = lastPageViewRef.current;

    if (
      lastPageView?.path === pagePath &&
      lastPageView?.navigationType === navigationType &&
      now - lastPageView.time <= STRICT_MODE_DUPLICATE_MS
    ) {
      return;
    }

    lastPageViewRef.current = {
      path: pagePath,
      navigationType,
      time: now,
    };

    sendClarityEvent("site_page_view", {
      clarity_page_path: pagePath,
      clarity_navigation_type: navigationType,
      clarity_page_title: document.title,
    });

    const history = routeHistoryRef.current;
    const previousRoute = history[history.length - 1];
    const routeBeforePrevious = history[history.length - 2];

    if (
      navigationType === "POP" &&
      previousRoute &&
      routeBeforePrevious?.path === pagePath &&
      now - previousRoute.time <= QUICK_BACK_WINDOW_MS
    ) {
      sendClarityEvent(
        "site_quick_back_candidate",
        {
          clarity_page_path: pagePath,
          clarity_previous_path: previousRoute.path,
          clarity_quick_back_ms: now - previousRoute.time,
        },
        "quick back candidate",
      );
    }

    routeHistoryRef.current = [
      ...history.slice(-4),
      { path: pagePath, time: now },
    ];
  }, [navigationType, pagePath, sendClarityEvent]);

  useEffect(() => {
    const trackRageClickCandidate = (details) => {
      const now = Date.now();
      const clickKey = `${details.clarity_page_path}:${details.clarity_element_signature}`;
      const recentClicks = (clickHistoryRef.current.get(clickKey) || []).filter(
        (clickTime) => now - clickTime <= RAGE_CLICK_WINDOW_MS,
      );

      recentClicks.push(now);
      clickHistoryRef.current.set(clickKey, recentClicks);

      if (recentClicks.length === RAGE_CLICK_COUNT) {
        sendClarityEvent(
          "site_rage_click_candidate",
          {
            ...details,
            clarity_rage_click_count: recentClicks.length,
            clarity_rage_click_window_ms: RAGE_CLICK_WINDOW_MS,
          },
          "rage click candidate",
        );
      }
    };

    const watchForDeadClickCandidate = (details) => {
      if (typeof MutationObserver === "undefined" || !document.body) return;

      const beforeUrl = window.location.href;
      const beforeScrollX = window.scrollX;
      const beforeScrollY = window.scrollY;
      const beforeActiveElement = document.activeElement;
      let pageChanged = false;
      let timeoutId;

      const observer = new MutationObserver(() => {
        pageChanged = true;
      });

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });

      const cleanup = () => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }

        observer.disconnect();
        pendingDeadClickChecksRef.current.delete(cleanup);
      };

      pendingDeadClickChecksRef.current.add(cleanup);

      timeoutId = window.setTimeout(() => {
        cleanup();

        const navigated = window.location.href !== beforeUrl;
        const scrolled =
          Math.abs(window.scrollX - beforeScrollX) > 8 ||
          Math.abs(window.scrollY - beforeScrollY) > 8;
        const focusMoved =
          document.activeElement !== beforeActiveElement &&
          document.activeElement !== document.body;

        if (!pageChanged && !navigated && !scrolled && !focusMoved) {
          sendClarityEvent(
            "site_dead_click_candidate",
            {
              ...details,
              clarity_dead_click_reason:
                "no_navigation_scroll_focus_or_dom_change",
            },
            "dead click candidate",
          );
        }
      }, DEAD_CLICK_CHECK_MS);
    };

    const handlePointerDown = (event) => {
      const disabledElement = getClosest(event.target, DISABLED_SELECTOR);

      if (!disabledElement) return;

      sendClarityEvent(
        "site_dead_click_candidate",
        {
          ...getElementDetails(disabledElement, pagePath),
          clarity_dead_click_reason: "disabled_element",
        },
        "dead click candidate",
      );
    };

    const handleClick = (event) => {
      const clickedElement = getClosest(event.target, INTERACTIVE_SELECTOR);

      if (!clickedElement) return;

      const details = getElementDetails(clickedElement, pagePath);
      const eventName =
        getCustomEventName(clickedElement) || getInteractionEventName(details);
      const upgradeReason =
        clickedElement.getAttribute("data-clarity-upgrade") || undefined;

      sendClarityEvent(eventName, details, upgradeReason);
      trackRageClickCandidate(details);

      if (details.clarity_element_kind !== "link") {
        watchForDeadClickCandidate(details);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
      Array.from(pendingDeadClickChecksRef.current).forEach((cleanup) =>
        cleanup(),
      );
    };
  }, [pagePath, sendClarityEvent]);

  useEffect(() => {
    let animationFrameId = null;
    const seenDepthMarks = new Set();
    const scrollState = {
      lastY: window.scrollY,
      totalDistance: 0,
      windowStartedAt: Date.now(),
      sentExcessiveScroll: false,
    };

    const handleScroll = () => {
      const now = Date.now();
      const currentY = Math.max(window.scrollY, 0);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const documentHeight = Math.max(getDocumentHeight(), viewportHeight);
      const scrollableHeight = documentHeight - viewportHeight;

      if (scrollableHeight <= MIN_SCROLLABLE_HEIGHT) {
        return;
      }

      const scrollDepth = Math.min(
        100,
        Math.round((currentY / scrollableHeight) * 100),
      );

      SCROLL_DEPTH_MARKS.forEach((mark) => {
        if (scrollDepth >= mark && !seenDepthMarks.has(mark)) {
          seenDepthMarks.add(mark);
          sendClarityEvent(`site_scroll_depth_${mark}`, {
            clarity_page_path: pagePath,
            clarity_scroll_depth: `${mark}%`,
          });
        }
      });

      if (now - scrollState.windowStartedAt > EXCESSIVE_SCROLL_WINDOW_MS) {
        scrollState.totalDistance = 0;
        scrollState.windowStartedAt = now;
        scrollState.sentExcessiveScroll = false;
      }

      scrollState.totalDistance += Math.abs(currentY - scrollState.lastY);
      scrollState.lastY = currentY;

      if (
        !scrollState.sentExcessiveScroll &&
        scrollState.totalDistance >= viewportHeight * EXCESSIVE_SCROLL_VIEWPORTS
      ) {
        scrollState.sentExcessiveScroll = true;
        sendClarityEvent(
          "site_excessive_scroll_candidate",
          {
            clarity_page_path: pagePath,
            clarity_scroll_distance: Math.round(scrollState.totalDistance),
            clarity_scrollable_height: Math.round(scrollableHeight),
          },
          "excessive scroll candidate",
        );
      }
    };

    const scheduleHandleScroll = () => {
      if (animationFrameId) return;

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        handleScroll();
      });
    };

    handleScroll();
    window.addEventListener("scroll", scheduleHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleHandleScroll);

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [pagePath, sendClarityEvent]);

  return null;
};

export default ClarityInteractionTracker;
