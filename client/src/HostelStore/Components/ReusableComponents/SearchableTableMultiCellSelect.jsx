import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const normalize = (value) => String(value ?? "").toLowerCase().trim();
const getOptionLabel = (option) => option?.label ?? option?.show ?? option?.name ?? String(option?.value ?? "");

const SearchableTableMultiCellSelect = forwardRef(({
  value = [],
  options = [],
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = "",
  className = "",
  align = "left"
}, ref) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isDisabled = disabled || readOnly;

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [openUp, setOpenUp] = useState(false);

  const normalizedOptions = useMemo(() => {
    return (options || []).map((opt) => ({
      ...opt,
      _label: getOptionLabel(opt),
    }));
  }, [options]);


  const selectedValues = Array.isArray(value) ? value : [];

  const displayValue = useMemo(() => {
    if (isOpen && isSearching) return search;
    if (selectedValues.length === 0) return "";

    const selectedLabels = selectedValues.map(val => {
      if (typeof val === 'object' && val !== null) {
        return val.label || val.name || val.show || String(val.value || "");
      }
      const opt = normalizedOptions.find(o => String(o.value) === String(val));
      return opt ? opt._label : val;
    });

    if (selectedLabels.length <= 2) return selectedLabels.join(", ");
    return `${selectedLabels[0]}, ${selectedLabels[1]} +${selectedLabels.length - 2} more`;
  }, [isOpen, isSearching, search, selectedValues, normalizedOptions]);

  const filteredOptions = useMemo(() => {
    if (!isSearching && isOpen) return normalizedOptions;
    const query = normalize(search);
    if (!query) return normalizedOptions;

    return normalizedOptions.filter(opt => normalize(opt._label).includes(query));
  }, [normalizedOptions, search, isSearching, isOpen]);

  const handleBlur = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false);
      setIsSearching(false);
      setSearch("");
    }
  };

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setOpenUp(true);
      } else {
        setOpenUp(false);
      }
    }
  }, [isOpen]);

  const toggleSelection = (option) => {
    const currentValues = [...selectedValues];
    const index = currentValues.findIndex(v => {
      const vValue = typeof v === 'object' && v !== null ? (v.value || v.vendorId || v.id) : v;
      return String(vValue) === String(option.value);
    });

    if (index === -1) {
      currentValues.push({ label: option._label, value: option.value });
    } else {
      currentValues.splice(index, 1);
    }

    if (onChange) onChange(currentValues);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full`}
      onBlur={handleBlur}
    >
      <div className={`relative h-full w-full`}>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={isDisabled}
          className={`h-full w-full border-0 bg-transparent py-0 text-[10px] shadow-none outline-none focus:bg-transparent focus:outline-none tx-table-input h-2 ${align === "right" ? "text-right" : "text-left"} ${className}`}
          onFocus={(event) => {
            if (isDisabled) return;
            if (!isOpen) {
              setIsOpen(true);
              setIsSearching(false);
              setSearch("");
            }
          }}
          onMouseDown={(event) => {
            if (isDisabled) return;
            if (isOpen && document.activeElement === event.target) {
              // Do nothing if already focused and open
            } else {
              setIsOpen(true);
              setIsSearching(false);
              setSearch("");
            }
          }}
          onChange={(event) => {
            if (isDisabled) return;
            setIsOpen(true);
            setIsSearching(true);
            setSearch(event.target.value);
          }}
        />

        <FaChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500" />

        {isOpen && !isDisabled && (
          <div
            ref={listRef}
            className={`absolute left-0 z-50 max-h-48 min-w-full w-max max-w-[300px] overflow-auto border border-slate-300 rounded-lg bg-white shadow-lg ${openUp ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"}`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions?.map((option) => {
                const isSelected = selectedValues.some(v => {
                  const vValue = typeof v === 'object' && v !== null ? (v.value || v.vendorId || v.id) : v;
                  return String(vValue) === String(option.value);
                });
                console.log(`Checking option ${option._label} (id: ${option.value}): isSelected = ${isSelected}`, selectedValues);
                return (
                  <label
                    key={option.value}
                    className="flex items-center w-full border-b border-slate-100 px-3 py-1.5 text-left text-[11px] hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={isSelected}
                      onChange={() => toggleSelection(option)}
                    />
                    <span className="text-slate-700">{option._label}</span>
                  </label>
                );
              })
            ) : (
              <div className="px-3 py-1.5 text-[11px] text-slate-500 italic">No matches</div>
            )}

            <div className="sticky bottom-0 bg-gray-50 p-2 border-t border-gray-200">
              <button
                type="button"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[11px] py-1 rounded transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setIsSearching(false);
                  setSearch("");
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default SearchableTableMultiCellSelect;
