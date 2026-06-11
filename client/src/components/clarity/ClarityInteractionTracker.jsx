import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const INTERACTIVE_SELECTOR =
  "button, a, [role='button'], input[type='button'], input[type='submit'], input[type='reset'], [data-clarity-click]";
const DISABLED_SELECTOR = "button:disabled, [disabled], [aria-disabled='true']";

const RAGE_CLICK_COUNT = 3;
const RAGE_CLICK_WINDOW_MS = 1600;
const DEAD_CLICK_CHECK_MS = 900;
const QUICK_BACK_WINDOW_MS = 5000;
const EXCESSIVE_SCROLL_WINDOW_MS = 6500;
const EXCESSIVE_SCROLL_VIEWPORTS = 5;
const SCROLL_DEPTH_MARKS = [25, 50, 75, 90, 100];

const normalizeValue = (value) =>
  String(value ?? "unknown")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "unknown";

const normalizeKeyPart = (value) =>
  normalizeValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 60);

const getClosest = (target, selector) => {
  if (!target || typeof target.closest !== "function") return null;
  return target.closest(selector);
};

const getElementLabel = (element) =>
  normalizeValue(
    element.getAttribute("data-clarity-label") ||
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.getAttribute("value") ||
      element.innerText ||
      element.textContent ||
      element.name ||
      element.id ||
      element.getAttribute("href") ||
      element.tagName,
  );

const getElementKind = (element) => {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "a") return "link";
  if (tagName === "input") return element.type || "input";
  if (element.getAttribute("role") === "button") return "role_button";

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
  const upgradedReasonsRef = useRef(new Set());
  const routeHistoryRef = useRef([]);

  const pagePath = useMemo(
    () => `${location.pathname}${location.search}${location.hash}`,
    [location.hash, location.pathname, location.search],
  );

  const sendClarityEvent = (eventName, tags = {}, upgradeReason) => {
    if (typeof window === "undefined" || typeof window.clarity !== "function") {
      return;
    }

    window.clarity("event", eventName);
    window.clarity("set", "clarity_last_event", eventName);

    Object.entries(tags).forEach(([key, value]) => {
      window.clarity("set", key, normalizeValue(value));
    });

    if (upgradeReason && !upgradedReasonsRef.current.has(upgradeReason)) {
      upgradedReasonsRef.current.add(upgradeReason);
      window.clarity("upgrade", upgradeReason);
    }
  };

  useEffect(() => {
    sendClarityEvent("site_page_view", {
      clarity_page_path: pagePath,
      clarity_navigation_type: navigationType,
      clarity_page_title: document.title,
    });

    const now = Date.now();
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
  }, [navigationType, pagePath]);

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
      if (typeof MutationObserver === "undefined") return;

      const beforeUrl = window.location.href;
      const beforeScrollX = window.scrollX;
      const beforeScrollY = window.scrollY;
      const beforeActiveElement = document.activeElement;
      let pageChanged = false;

      const observer = new MutationObserver(() => {
        pageChanged = true;
      });

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });

      window.setTimeout(() => {
        observer.disconnect();

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
        details.clarity_element_kind === "link"
          ? "site_link_click"
          : "site_button_click";

      sendClarityEvent(eventName, details);
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
    };
  }, [pagePath]);

  useEffect(() => {
    const seenDepthMarks = new Set();
    const scrollState = {
      lastY: window.scrollY,
      totalDistance: 0,
      windowStartedAt: Date.now(),
      sentExcessiveScroll: false,
    };

    const handleScroll = () => {
      const now = Date.now();
      const currentY = window.scrollY;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const documentHeight = Math.max(getDocumentHeight(), viewportHeight);
      const scrollableHeight = Math.max(documentHeight - viewportHeight, 1);
      const scrollDepth = Math.min(
        100,
        Math.round(((currentY + viewportHeight) / documentHeight) * 100),
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

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pagePath]);

  return null;
};

export default ClarityInteractionTracker;
