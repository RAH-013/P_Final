import {
  deleteMyAccount,
  deleteUser,
  getMyProfile,
  updateMyPassword,
  updateMyUsername,
  updateUserRole,
} from "../api/services/users";

import type { UserRole } from "../api/types";
import { useApiRequest } from "./useApiRequest";

export function useUsers() {
  const profileRequest = useApiRequest(getMyProfile);
  const deleteAccountRequest = useApiRequest(deleteMyAccount);
  const usernameRequest = useApiRequest(updateMyUsername);
  const passwordRequest = useApiRequest(updateMyPassword);
  const deleteUserRequest = useApiRequest(deleteUser);
  const roleRequest = useApiRequest(updateUserRole);

  return {
    getProfile: profileRequest.execute,
    profile: profileRequest.data,
    profileLoading: profileRequest.loading,
    profileError: profileRequest.error,

    deleteAccount: deleteAccountRequest.execute,
    deletingAccount: deleteAccountRequest.loading,

    updateUsername: usernameRequest.execute,
    updatingUsername: usernameRequest.loading,

    updatePassword: passwordRequest.execute,
    updatingPassword: passwordRequest.loading,

    deleteUser: deleteUserRequest.execute,
    deletingUser: deleteUserRequest.loading,

    updateUserRole: (id: number, role: UserRole) =>
      roleRequest.execute(id, { role }),
    updatingRole: roleRequest.loading,

    error:
      profileRequest.error ??
      deleteAccountRequest.error ??
      usernameRequest.error ??
      passwordRequest.error ??
      deleteUserRequest.error ??
      roleRequest.error,
  };
}
