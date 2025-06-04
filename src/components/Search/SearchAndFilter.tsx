import { Search, Filter, Download, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import { FilterState } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface SearchAndFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExport: () => void;
  candidateCount: number;
}

export function SearchAndFilter({ filters, onFiltersChange, onExport, candidateCount }: SearchAndFilterProps) {
  const { settings } = useSettings();

  const updateFieldFilter = (fieldId: string, value: any) => {
    onFiltersChange({
      ...filters,
      fieldFilters: {
        ...filters.fieldFilters,
        [fieldId]: value
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      fieldFilters: {},
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const activeFiltersCount = Object.keys(filters.fieldFilters).filter(key => 
    filters.fieldFilters[key] && filters.fieldFilters[key] !== 'all'
  ).length + (filters.search ? 1 : 0);

  return (
    <div className="bg-dark-200 border border-dark-300 rounded-lg p-6 space-y-4">
      {/* Full Width Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${settings.entityName.toLowerCase()} by name, location, role, or any field...`}
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-12 pr-4 py-3 bg-dark-100 text-white rounded-lg border border-dark-300 
                   focus:border-blue-500 focus:outline-none placeholder-gray-500 text-base"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Left side - Field Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {settings.fields.filter(f => f.type === 'dropdown').map((fieldConfig) => (
            <div key={fieldConfig.id} className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <div className="relative">
                <select
                  value={filters.fieldFilters[fieldConfig.id] || 'all'}
                  onChange={(e) => updateFieldFilter(fieldConfig.id, e.target.value === 'all' ? '' : e.target.value)}
                  className="bg-dark-100 text-white rounded-lg border border-dark-300 px-3 py-2 pr-8
                           focus:border-blue-500 focus:outline-none min-w-[140px] appearance-none cursor-pointer"
                >
                  <option value="all">All {fieldConfig.label}</option>
                  {(fieldConfig.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Sort and Export */}
        <div className="flex items-center gap-3">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                className="bg-dark-100 text-white rounded-lg border border-dark-300 px-3 py-2 pr-8
                         focus:border-blue-500 focus:outline-none min-w-[140px] appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                {settings.fields.filter(f => f.type === 'text').map((field) => (
                  <option key={field.id} value={field.id}>Sort by {field.label}</option>
                ))}
                <option value="createdAt">Sort by Date Added</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            
            <button
              onClick={() => onFiltersChange({ 
                ...filters, 
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
              })}
              className="p-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       hover:bg-dark-300 transition-colors"
            >
              {filters.sortOrder === 'asc' ? 
                <SortAsc className="w-4 h-4" /> : 
                <SortDesc className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                     hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Excel</span>
            <span className="sm:hidden">Export</span>
            <span className="bg-green-700/50 px-2 py-0.5 rounded text-xs">
              {candidateCount}
            </span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-dark-300">
          {filters.search && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
              <Search className="w-3 h-3" />
              Search: "{filters.search}"
            </span>
          )}
          {Object.entries(filters.fieldFilters).map(([fieldId, value]) => {
            if (!value) return null;
            const fieldConfig = settings.fields.find(f => f.id === fieldId);
            return (
              <span key={fieldId} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                <Filter className="w-3 h-3" />
                {fieldConfig?.label}: {value}
              </span>
            );
          })}
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-gray-600/20 text-gray-300 rounded-full text-sm hover:bg-gray-600/40 transition-colors"
          >
            Clear all ({activeFiltersCount})
          </button>
        </div>
      )}
    </div>
  );
}
