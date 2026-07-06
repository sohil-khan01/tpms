import { useState, useRef, useEffect } from 'react';

/**
 * Searchable Select Component
 * A dropdown with search functionality
 */
const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...', 
  searchPlaceholder = 'Search...',
  darkMode = false,
  displayKey = 'name',
  valueKey = 'id',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const displayValue = typeof option === 'object' ? option[displayKey] : option;
    return displayValue?.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get selected option display text
  const selectedOption = options.find(opt => {
    const optValue = typeof opt === 'object' ? opt[valueKey] : opt;
    return optValue === value;
  });
  
  const selectedText = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption[displayKey] : selectedOption)
    : placeholder;

  const handleSelect = (option) => {
    const optValue = typeof option === 'object' ? option[valueKey] : option;
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${
          darkMode 
            ? 'bg-slate-700 border-slate-600 text-white' 
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        <span className={!value ? 'text-slate-400' : ''}>{selectedText}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border ${
          darkMode 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-white border-slate-200'
        }`}>
          {/* Search Input */}
          <div className="p-2 border-b ${darkMode ? 'border-slate-600' : 'border-slate-200'}">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 text-sm text-center ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                No results found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optValue = typeof option === 'object' ? option[valueKey] : option;
                const optDisplay = typeof option === 'object' ? option[displayKey] : option;
                const isSelected = optValue === value;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : darkMode 
                          ? 'text-slate-200 hover:bg-slate-600' 
                          : 'text-slate-700'
                    }`}
                  >
                    {optDisplay}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
