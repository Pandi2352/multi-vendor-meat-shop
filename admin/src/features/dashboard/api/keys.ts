export const dashboardKeys = {
  all: ['dashboard'] as const,
  vendor: () => [...dashboardKeys.all, 'vendor'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
};
