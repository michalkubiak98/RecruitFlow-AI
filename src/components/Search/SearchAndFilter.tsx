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
    <div className="bg-dark-200 border border-dark-300 rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${settings.entityName.toLowerCase()} by name or any field...`}
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                     focus:border-blue-500 focus:outline-none placeholder-gray-500"
          />
        </div>

        {/* Dynamic Field Filters */}
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

        {/* Sort */}
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
                     hover:bg-dark-300"
          >
            {filters.sortOrder === 'asc' ? 
              <SortAsc className="w-4 h-4" /> : 
              <SortDesc className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                     hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download Excel ({candidateCount})
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
              Search: "{filters.search}"
            </span>
          )}
          {Object.entries(filters.fieldFilters).map(([fieldId, value]) => {
            if (!value) return null;
            const fieldConfig = settings.fields.find(f => f.id === fieldId);
            return (
              <span key={fieldId} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                {fieldConfig?.label}: {value}
              </span>
            );
          })}
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-gray-600/20 text-gray-300 rounded-full text-sm hover:bg-gray-600/40"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
