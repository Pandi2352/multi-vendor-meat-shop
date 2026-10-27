import { Role, VendorVerificationStatus } from '#common/enums';
import { createStateMachine } from '#common/utils';

export const VENDOR_VERIFICATION_MACHINE = createStateMachine<VendorVerificationStatus, Role>(
  'VendorVerification',
  [
    { from: VendorVerificationStatus.DRAFT, to: VendorVerificationStatus.SUBMITTED },
    {
      from: VendorVerificationStatus.RESUBMISSION_REQUIRED,
      to: VendorVerificationStatus.SUBMITTED,
    },
    {
      from: VendorVerificationStatus.SUBMITTED,
      to: VendorVerificationStatus.UNDER_REVIEW,
      actors: [Role.ADMIN, Role.OPERATIONS],
    },
    {
      from: [VendorVerificationStatus.SUBMITTED, VendorVerificationStatus.UNDER_REVIEW],
      to: VendorVerificationStatus.APPROVED,
      actors: [Role.ADMIN],
    },
    {
      from: [VendorVerificationStatus.SUBMITTED, VendorVerificationStatus.UNDER_REVIEW],
      to: VendorVerificationStatus.RESUBMISSION_REQUIRED,
      actors: [Role.ADMIN, Role.OPERATIONS],
    },
    {
      from: [VendorVerificationStatus.SUBMITTED, VendorVerificationStatus.UNDER_REVIEW],
      to: VendorVerificationStatus.REJECTED,
      actors: [Role.ADMIN],
    },
    {
      from: VendorVerificationStatus.APPROVED,
      to: VendorVerificationStatus.SUSPENDED,
      actors: [Role.ADMIN],
    },
    {
      from: VendorVerificationStatus.SUSPENDED,
      to: VendorVerificationStatus.APPROVED,
      actors: [Role.ADMIN],
    },
  ],
);
