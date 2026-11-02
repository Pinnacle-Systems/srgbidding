import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";

// Gap between tab pills (Tailwind `gap-1.5` = 0.375rem = 6px)
const TAB_GAP = 6;
// Space reserved for the ">> N" overflow button (button ~52px + gap)
const OVERFLOW_BTN_WIDTH = 60;
// Used only for the very first paint, before real tab widths are measured
const FALLBACK_TAB_WIDTH = 170;

/**
 * One tab pill. Rendered twice: once visibly (interactive) and once inside a
 * hidden measuring layer (non-interactive) so we know each tab's REAL width.
 */
const TabPill = ({
  tab,
  isActive,
  interactive = true,
  pillRef = null,
  onSelect,
  onClose,
}) => (
  <div
    ref={pillRef}
    data-tab-name={tab.name}
    className={`h-[26px] px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-150 select-none flex-shrink-0 cursor-pointer shadow-xs leading-none ${isActive
      ? "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white border border-blue-400/40 shadow-sm shadow-blue-500/25 ring-1 ring-blue-500/20"
      : "bg-slate-50/90 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
      }`}
    onClick={interactive ? onSelect : undefined}
    title={interactive ? tab.name : undefined}
  >
    <span className="tracking-wide uppercase whitespace-nowrap leading-none text-[11px]">
      {tab.name}
    </span>
    <button
      type="button"
      tabIndex={interactive ? 0 : -1}
      className={`w-4 h-4 p-0 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer text-[10px] leading-none ${isActive
        ? "text-blue-200 hover:bg-white/20 hover:text-white"
        : "text-slate-400 hover:bg-rose-500 hover:text-white"
        }`}
      onClick={interactive ? onClose : undefined}
      title={interactive ? `Close ${tab.name}` : undefined}
    >
      {CLOSE_ICON}
    </button>
  </div>
);

/**
 * Decide which contiguous slice [start, end) of the tabs is shown in the strip.
 *  - Everything fits            -> show all
 *  - Otherwise fill from the left as many tabs as fit in `budget`
 *  - If the active tab is not in that slice, anchor the active tab at the right
 *    edge and extend leftwards (the active tab is ALWAYS visible)
 * At least one tab is always shown.
 */
const getVisibleRange = (tabs, activeIdx, available, widthOf) => {
  const total = tabs.reduce(
    (sum, t, i) => sum + widthOf(t) + (i > 0 ? TAB_GAP : 0),
    0,
  );
  if (total <= available) return [0, tabs.length];

  const budget = Math.max(0, available - OVERFLOW_BTN_WIDTH);

  // Pass 1: fill from the left
  let used = 0;
  let end = 0;
  while (end < tabs.length) {
    const w = widthOf(tabs[end]) + (end > 0 ? TAB_GAP : 0);
    if (end > 0 && used + w > budget) break;
    used += w;
    end++;
  }
  if (activeIdx < 0 || activeIdx < end) return [0, end];

  // Pass 2: active tab is outside -> end the window on the active tab
  let start = activeIdx;
  used = widthOf(tabs[activeIdx]);
  while (start > 0) {
    const w = widthOf(tabs[start - 1]) + TAB_GAP;
    if (used + w > budget) break;
    used += w;
    start--;
  }
  return [start, activeIdx + 1];
};

const ActiveTabsHeader = ({ className = "" }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const measureRef = useRef(null);

  // Real rendered width of every open tab, keyed by tab name
  const [tabWidths, setTabWidths] = useState({});

  // Maximum width available for tabs up to the search bar
  const [maxAvailableWidth, setMaxAvailableWidth] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    return Math.max(250, w - 600);
  });

  const updateSearchBoundary = useCallback(() => {
    if (typeof window === "undefined") return;

    // Dynamically locate the search bar input in the top header
    const searchInput =
      document.querySelector('input[placeholder*="SEARCH" i]') ||
      document.getElementById("pageSearch") ||
      document.querySelector("[data-page-search]");

    let boundaryX = window.innerWidth - 580; // Default right offset for PageSearch + profile

    if (searchInput) {
      const searchRect = searchInput.getBoundingClientRect();
      if (searchRect.left > 200) {
        // Stop 20px before the search bar begins
        boundaryX = searchRect.left - 20;
      }
    }

    let containerLeft = 0;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.left > 0) containerLeft = rect.left;
    }

    const available = Math.max(200, boundaryX - containerLeft);
    setMaxAvailableWidth(available);
  }, []);

  useEffect(() => {
    updateSearchBoundary();
    window.addEventListener("resize", updateSearchBoundary);

    const t1 = setTimeout(updateSearchBoundary, 100);
    const t2 = setTimeout(updateSearchBoundary, 400);

    return () => {
      window.removeEventListener("resize", updateSearchBoundary);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateSearchBoundary]);

  // Robust click outside & Escape key listener
  useEffect(() => {
    if (!showHidden) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowHidden(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowHidden(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showHidden]);

  const tabsList = openTabs?.tabs || [];
  const hasTabs = tabsList.length > 0;
  const activeIndex = tabsList.findIndex((t) => t.active);
  const tabNamesKey = tabsList.map((t) => t.name).join("|");

  // Measure the real width of every tab from the hidden measuring layer
  const measureTabs = useCallback(() => {
    const root = measureRef.current;
    if (!root) return;
    const next = {};
    Array.from(root.children).forEach((el) => {
      next[el.dataset.tabName] = el.getBoundingClientRect().width;
    });
    setTabWidths((prev) => {
      const nextKeys = Object.keys(next);
      const same =
        Object.keys(prev).length === nextKeys.length &&
        nextKeys.every((k) => Math.abs((prev[k] ?? -1) - next[k]) < 0.5);
      return same ? prev : next;
    });
  }, []);

  // Re-measure (before paint) whenever the set/order of open tabs changes
  useLayoutEffect(() => {
    measureTabs();
  }, [tabNamesKey, measureTabs]);

  // Re-measure when the web font finishes loading / the layer changes size
  useEffect(() => {
    if (!hasTabs) return;
    let observer;
    if (typeof ResizeObserver !== "undefined" && measureRef.current) {
      observer = new ResizeObserver(() => measureTabs());
      observer.observe(measureRef.current);
    }
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measureTabs).catch(() => { });
    }
    return () => observer?.disconnect();
  }, [hasTabs, measureTabs]);

  // Scroll active tab into view when activeIndex changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  if (!hasTabs) return null;

  // Split tabs into "shown in the strip" and "hidden behind the >> button"
  // based on the REAL measured widths, not an assumed per-tab width.
  const widthOf = (tab) => tabWidths[tab.name] ?? FALLBACK_TAB_WIDTH;
  const [startIndex, endIndex] = getVisibleRange(
    tabsList,
    activeIndex,
    maxAvailableWidth,
    widthOf,
  );
  const currentShowingTabs = tabsList.slice(startIndex, endIndex);
  const hiddenTabs = [
    ...tabsList.slice(0, startIndex),
    ...tabsList.slice(endIndex),
  ];

  const handleWheel = (e) => {
    if (e.deltaY !== 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`active-tabs-header flex items-center gap-1.5 relative min-w-0 max-w-full ${className}`}
      style={{ maxWidth: `${maxAvailableWidth}px` }}
    >
      {/* Hidden layer used only to measure each tab's real width */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute left-0 top-0 flex w-max items-center gap-1.5 invisible pointer-events-none"
        style={{ height: 0, overflow: "hidden" }}
      >
        {tabsList.map((tab) => (
          <TabPill
            key={tab.name}
            tab={tab}
            isActive={Boolean(tab.active)}
            interactive={false}
          />
        ))}
      </div>

      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        style={{
          maxWidth: `${Math.max(100, maxAvailableWidth - (hiddenTabs.length > 0 ? OVERFLOW_BTN_WIDTH : 0))}px`,
        }}
        className="flex items-center gap-1.5 py-0 min-w-0 overflow-hidden h-7"
      >
        {currentShowingTabs.map((tab, index) => {
          const isActive = Boolean(tab.active);
          return (
            <TabPill
              key={tab.name || index}
              tab={tab}
              isActive={isActive}
              pillRef={isActive ? activeTabRef : null}
              onSelect={() => {
                if (!isActive) {
                  dispatch(push({ name: tab.name }));
                }
              }}
              onClose={(e) => {
                e.stopPropagation();
                dispatch(remove({ name: tab.name }));
              }}
            />
          );
        })}
      </div>
      {hiddenTabs.length > 0 && (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowHidden((prev) => !prev)}
            className="h-[26px] px-2 text-xs text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-150 flex items-center gap-1 cursor-pointer bg-white shadow-xs select-none"
            title={`${hiddenTabs.length} more tabs hidden inside. Click to open`}
          >
            {DOUBLE_NEXT_ICON}
            <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full leading-tight">
              {hiddenTabs.length}
            </span>
          </button>

          {showHidden && (
            <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999] min-w-[220px] max-w-[320px] max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Hidden Tabs ({hiddenTabs.length})</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Click to switch
                </span>
              </div>
              <ul className="py-1 overflow-y-auto max-h-60 text-xs">
                {hiddenTabs.map((tab) => (
                  <li
                    key={tab.name}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all duration-150 ${tab.active
                      ? "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-semibold"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                      }`}
                    onClick={() => {
                      dispatch(push({ name: tab.name }));
                      setShowHidden(false);
                    }}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="truncate uppercase text-[11px] font-semibold">
                        {tab.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`w-4 h-4 p-0 rounded-full transition flex items-center justify-center flex-shrink-0 text-[10px] ${tab.active
                        ? "text-blue-200 hover:bg-white/20 hover:text-white"
                        : "text-slate-400 hover:bg-rose-500 hover:text-white"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(remove({ name: tab.name }));
                      }}
                      title={`Close ${tab.name}`}
                    >
                      {CLOSE_ICON}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveTabsHeader;
