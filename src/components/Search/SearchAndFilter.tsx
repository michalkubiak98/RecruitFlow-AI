import { Search, Filter, Download, SortAsc, SortDesc, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { FilterState } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface SearchAndFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExport: () => void;
  candidateCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function SearchAndFilter({ 
  filters, 
  onFiltersChange, 
  onExport, 
  candidateCount, 
  viewMode, 
  onViewModeChange 
}: SearchAndFilterProps) {
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
    <div className="card-primary space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${settings.entityName.toLowerCase()} by name or any field...`}
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-12 pr-4 py-3 bg-dark-200 text-primary rounded-lg border border-dark-400 
                   focus:border-primary-500 focus:outline-none placeholder-subtle transition-colors"
        />
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Left side - Field Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {settings.fields.filter(f => f.type === 'dropdown').map((fieldConfig) => (
            <div key={fieldConfig.id} className="flex items-center gap-2">
              <Filter className="text-muted w-4 h-4" />
              <div className="relative">
                <select
                  value={filters.fieldFilters[fieldConfig.id] || 'all'}
                  onChange={(e) => updateFieldFilter(fieldConfig.id, e.target.value === 'all' ? '' : e.target.value)}
                  className="bg-dark-200 text-primary rounded-lg border border-dark-400 px-3 py-2 pr-8
                           focus:border-primary-500 focus:outline-none min-w-[140px] appearance-none cursor-pointer"
                >
                  <option value="all">All {fieldConfig.label}</option>
                  {(fieldConfig.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Sort, View, Export */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-dark-200 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'text-muted hover:text-primary hover:bg-dark-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'text-muted hover:text-primary hover:bg-dark-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                className="bg-dark-200 text-primary rounded-lg border border-dark-400 px-3 py-2 pr-8
                         focus:border-primary-500 focus:outline-none min-w-[140px] appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                {settings.fields.filter(f => f.type === 'text').map((field) => (
                  <option key={field.id} value={field.id}>Sort by {field.label}</option>
                ))}
                <option value="createdAt">Sort by Date Added</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
            </div>
            
            <button
              onClick={() => onFiltersChange({ 
                ...filters, 
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
              })}
              className="p-2 bg-dark-200 text-primary rounded-lg border border-dark-400 
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
            className="button-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="badge bg-primary-600 text-white px-2 py-0.5 text-xs font-medium">
              {candidateCount}
            </span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-dark-300">
          {filters.search && (
            <span className="badge badge-primary flex items-center gap-2">
              <Search className="w-3 h-3" />
              Search: "{filters.search}"
            </span>
          )}
          {Object.entries(filters.fieldFilters).map(([fieldId, value]) => {
            if (!value) return null;
            const fieldConfig = settings.fields.find(f => f.id === fieldId);
            return (
              <span key={fieldId} className="badge bg-dark-300 text-primary flex items-center gap-2">
                <Filter className="w-3 h-3" />
                {fieldConfig?.label}: {value}
              </span>
            );
          })}
          <button
            onClick={clearFilters}
            className="text-caption-subtle hover:text-muted transition-colors px-2 py-1 rounded"
          >
            Clear all ({activeFiltersCount})
          </button>
        </div>
      )}
    </div>
  );
}
