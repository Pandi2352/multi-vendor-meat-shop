import { ErrorState, LoaderState } from '@/components/ui';
import { useCurrentUser } from '@/features/auth';
import { getErrorMessage } from '@/lib/api-error';
import { useAdminDashboard } from '../api/use-admin-dashboard';
import { AdminShortcuts } from '../components/admin-shortcuts';
import { AdminStatGrid } from '../components/admin-stat-grid';
import { DashboardHeader } from '../components/dashboard-header';

/** Home for the admin team: what is waiting on someone across the marketplace right now. */
export function AdminDashboardPage() {
  const user = useCurrentUser();
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useAdminDashboard();

  if (!user || isLoading) return <LoaderState title="Loading the marketplace…" description="Shops, orders and deliveries" />;
  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn’t load the dashboard"
        description={getErrorMessage(error)}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <DashboardHeader
        title="Marketplace overview"
        subtitle={`Signed in as ${user.roleLabel}. Numbers cover all shops.`}
        date={data.date}
        updatedAt={dataUpdatedAt}
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <AdminStatGrid data={data} role={user.role} />
        <AdminShortcuts role={user.role} />
      </div>
    </div>
  );
}
