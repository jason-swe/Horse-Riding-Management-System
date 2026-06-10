import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { adaptAdminUsers, adaptRoleApplications } from "./adminApiAdapters";

export function useAdminModuleApi(moduleName) {
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const supportsLiveData = moduleName === "users" || moduleName === "registrations";

  const load = useCallback(async () => {
    if (!supportsLiveData) {
      setLiveData(null);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (moduleName === "users") {
        const data = await adminApi.listUsers({ page: 1, limit: 100 });
        setLiveData(adaptAdminUsers(data));
      }

      if (moduleName === "registrations") {
        const data = await adminApi.listRoleApplications();
        setLiveData(adaptRoleApplications(data));
      }
    } catch (apiError) {
      setError(apiError.message || "Unable to load live admin data. Showing sample data.");
      setLiveData(null);
    } finally {
      setIsLoading(false);
    }
  }, [moduleName, supportsLiveData]);

  useEffect(() => {
    load();
  }, [load]);

  const applyRowAction = useCallback(async ({ actionLabel, id, note }) => {
    if (!supportsLiveData) return false;

    if (moduleName === "users") {
      if (actionLabel === "Activate") {
        await adminApi.updateUserStatus(id, "active");
        await load();
        return true;
      }

      if (actionLabel === "Suspend") {
        await adminApi.updateUserStatus(id, "blocked");
        await load();
        return true;
      }
    }

    if (moduleName === "registrations") {
      if (actionLabel === "Approve") {
        await adminApi.approveRoleApplication(id, note || "Documents verified");
        await load();
        return true;
      }

      if (actionLabel === "Reject") {
        await adminApi.rejectRoleApplication(id, note || "Rejected by admin review");
        await load();
        return true;
      }
    }

    return false;
  }, [load, moduleName, supportsLiveData]);

  return {
    liveData,
    isLoading,
    error,
    reload: load,
    applyRowAction,
    supportsLiveData,
  };
}
