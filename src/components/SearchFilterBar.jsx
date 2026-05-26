import React, { useEffect, useRef, useState } from "react";

const SearchFilterBar = ({ onSearch, onFilterChange, initialValue = "" }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filterOptions = [
    { value: "all", label: "All Categories" },
    { value: "active", label: "Active" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ];

  const selectedLabel = filterOptions.find((option) => option.value === selectedFilter)?.label ?? "All Categories";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setSelectedFilter(value);
    setIsOpen(false);
    onFilterChange(value);
  };

  return (
    <div style={{
      display: "flex",
      gap: "16px",
      marginBottom: "24px",
      flexWrap: "wrap",
      alignItems: "center"
    }}>
      <div style={{
        position: "relative",
        flex: 1,
        minWidth: "300px"
      }}>
        <input
          type="text"
          placeholder="Search horses, jockeys, or tournaments..."
          value={initialValue}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(238, 231, 212, 0.3)",
            backgroundColor: "rgba(238, 231, 212, 0.05)",
            color: "#EEE7D4",
            fontSize: "0.9rem",
            outline: "none",
            transition: "border-color 160ms ease",
          }}
          onFocus={(e) => e.target.style.borderColor = "#EEE7D4"}
          onBlur={(e) => e.target.style.borderColor = "rgba(238, 231, 212, 0.3)"}
        />
      </div>

      <div className="search-filter-dropdown" ref={dropdownRef}>
        <button
          className={`search-filter-dropdown__button ${isOpen ? "search-filter-dropdown__button--open" : ""}`}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedLabel}</span>
          <span className="search-filter-dropdown__chevron" aria-hidden="true">v</span>
        </button>

        <div className={`search-filter-dropdown__menu ${isOpen ? "search-filter-dropdown__menu--open" : ""}`} role="listbox">
          {filterOptions.map((option) => (
            <button
              className={`search-filter-dropdown__option ${selectedFilter === option.value ? "search-filter-dropdown__option--active" : ""}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={selectedFilter === option.value}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
