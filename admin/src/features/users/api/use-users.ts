import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type AssignRolePayload,
  type InviteUserPayload,
  type UpdateUserStatusPayload,
  type UserRole,
} from './users.api';
import { userKeys } from './keys';

export const useAdminUsers = (filters: Record<string, unknown> = {}) =>
  useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.list(filters),
  });

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRolePayload }) =>
      usersApi.assignRole(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserStatusPayload }) =>
      usersApi.updateStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUserInvitations = (status?: string) =>
  useQuery({
    queryKey: userKeys.invitations(status),
    queryFn: () => usersApi.listInvitations(status),
  });

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserPayload) => usersApi.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useRolesWithPermissions = () =>
  useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => usersApi.listRoles(),
  });

export const usePermissionCatalog = () =>
  useQuery({
    queryKey: userKeys.permissions(),
    queryFn: () => usersApi.listPermissionsCatalog(),
  });

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissions }: { role: UserRole; permissions: string[] }) =>
      usersApi.updateRolePermissions(role, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles() });
    },
  });
};
