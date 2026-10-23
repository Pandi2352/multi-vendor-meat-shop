import { X, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Spinner, Badge } from '@/components/ui';
import { formatDateIST, formatWeight } from '@/utils/format';
import { useProductMovements } from '../api/use-inventory';

interface StockMovementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function StockMovementsDrawer({
  isOpen,
  onClose,
  productId,
  productName,
}: StockMovementsDrawerProps) {
  const { data: movements, isLoading } = useProductMovements(productId, { enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-surface border-l border-border p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-base font-semibold text-text">Stock Movement History</h3>
                <p className="text-xs text-muted truncate max-w-[240px]">{productName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-muted hover:text-text rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Spinner size="md" />
              <p className="mt-2 text-xs text-muted">Loading movements ledger...</p>
            </div>
          ) : !movements || movements.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted">
              No stock movements recorded yet for this cut.
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((m) => {
                const isPositive = ['OPENING', 'RECEIVED', 'RETURNED'].includes(m.type);
                return (
                  <div key={m.id} className="p-3 rounded-md border border-border bg-surface-muted text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isPositive ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-danger" />
                        )}
                        <span className={isPositive ? 'text-success' : 'text-danger'}>
                          {isPositive ? `+${formatWeight(m.grams)}` : `-${formatWeight(m.grams)}`}
                        </span>
                      </div>
                      <Badge
                        tone={
                          m.type === 'OPENING'
                            ? 'success'
                            : m.type === 'WASTAGE'
                            ? 'danger'
                            : m.type === 'RESERVED'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {m.type}
                      </Badge>
                    </div>

                    {m.notes && <p className="text-muted mt-1 text-[11px]">{m.notes}</p>}
                    <p className="text-[10px] text-muted mt-1">{formatDateIST(m.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold rounded-md border border-border bg-surface-muted text-text hover:bg-surface transition-colors"
          >
            Close Audit Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
