import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatDateIST, formatINR } from '@/utils/format';
import type { LedgerEntry } from '../api/finance.api';

interface LedgerTableProps {
  entries: LedgerEntry[];
  isLoading?: boolean;
}

export function LedgerTable({ entries, isLoading }: LedgerTableProps) {
  if (isLoading) {
    return <div className="text-center py-10 text-xs text-muted">Loading financial ledger records...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 rounded-md border border-dashed border-border bg-surface text-xs text-muted">
        No ledger entries recorded yet. Entries are automatically created upon COD order delivery.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-surface-raised border-b border-border text-muted font-medium">
            <tr>
              <th className="py-2.5 px-3">Date (IST)</th>
              <th className="py-2.5 px-3">Flow</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Reference</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text">
            {entries.map((entry) => {
              const isCredit = entry.direction === 'CREDIT';
              return (
                <tr key={entry.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-muted">
                    {formatDateIST(entry.createdAt)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {entry.direction}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium">{entry.entryType}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-muted">
                    {entry.referenceId}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-muted">{entry.description}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${
                      isCredit ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {isCredit ? '+' : '-'} {formatINR(entry.amountPaise)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap text-text">
                    {formatINR(entry.balanceAfterPaise)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
