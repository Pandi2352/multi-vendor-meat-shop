import { useState } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { useDocumentTitle } from '@/hooks';
import { useCustomerTickets } from '../api/use-tickets';
import { TicketCard } from '../components/ticket-card';

type FilterTab = 'ALL' | 'ACTIVE' | 'RESOLVED';

export function TicketsPage() {
  useDocumentTitle('Support Tickets');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const { data: tickets = [], isLoading, refetch, isFetching } = useCustomerTickets();

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'ACTIVE') {
      return t.status === 'OPEN' || t.status === 'UNDER_REVIEW';
    }
    if (activeTab === 'RESOLVED') {
      return (
        t.status === 'RESOLVED_REFUND_FULL' ||
        t.status === 'RESOLVED_REFUND_PARTIAL' ||
        t.status === 'RESOLVED_REJECTED'
      );
    }
    return true;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text">Customer Support & Disputes</h2>
          <p className="text-xs text-muted mt-1">
            Track order complaints, refund requests, and stall quality investigations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          loading={isFetching}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-muted text-muted hover:text-text hover:bg-border'
            }`}
          >
            {tab === 'ALL' && 'All Tickets'}
            {tab === 'ACTIVE' && 'Active / In Review'}
            {tab === 'RESOLVED' && 'Resolved'}
          </button>
        ))}
      </div>

      {/* Ticket List / States */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-md" />
          <Skeleton className="h-36 w-full rounded-md" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="No support tickets found"
            description={
              activeTab === 'ALL'
                ? 'You have not reported any issues with your meat orders. Need help? You can report an issue directly from any order page.'
                : 'No tickets match the selected filter.'
            }
            icon={HelpCircle}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </main>
  );
}
