import { LayoutGrid, List } from 'lucide-react';
import { Tabs, SearchInput, Select, type TabItem, type SelectOption } from '@/components/ui';

export type VendorTab = 'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED';
export type ViewMode = 'grid' | 'table';

interface VendorToolbarProps {
  tab: VendorTab;
  tabItems: TabItem<VendorTab>[];
  onTabChange: (tab: VendorTab) => void;
  selectedTown: string;
  townOptions: SelectOption[];
  onTownChange: (town: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/** Filter tabs, town dropdown, search input and grid/table view switcher. */
export function VendorToolbar({
  tab,
  tabItems,
  onTabChange,
  selectedTown,
  townOptions,
  onTownChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: VendorToolbarProps) {
  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 pt-1">
      <Tabs<VendorTab> tabs={tabItems} activeTab={tab} onChange={onTabChange} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-44">
          <Select
            options={townOptions}
            value={selectedTown}
            onChange={(val: string | string[]) =>
              onTownChange(Array.isArray(val) ? val[0] || 'ALL' : val || 'ALL')
            }
            size="sm"
            clearable={false}
            placeholder="Filter Town"
          />
        </div>
        <div className="w-56 sm:w-64">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search stall, owner, or FSSAI..."
          />
        </div>
        <div className="flex items-center rounded-md border border-border bg-surface p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:text-text hover:bg-surface-muted'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:text-text hover:bg-surface-muted'
            }`}
            title="Table View"
            aria-label="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
