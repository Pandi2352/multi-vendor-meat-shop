export const vendorStaffKeys = {
  all: ['vendor-staff'] as const,
  list: () => [...vendorStaffKeys.all, 'list'] as const,
};
