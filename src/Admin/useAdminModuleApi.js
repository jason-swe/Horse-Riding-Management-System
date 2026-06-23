import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import {
  adaptAdminUserDetail,
  adaptAdminRaceResultDetail,
  adaptAdminRaceResults,
  adaptAdminUsers,
  adaptRaceRegistrationDetail,
  adaptRaceRegistrations,
} from "./adminApiAdapters";

export function useAdminModuleApi(moduleName) {
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const supportsLiveData = ["users", "registrations", "results"].includes(moduleName);

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
        const data = await adminApi.listRegistrations({ page: 1, limit: 100 });
        setLiveData(adaptRaceRegistrations(data));
      }

      if (moduleName === "results") {
        setLiveData(adaptAdminRaceResults(await adminApi.listRaceResults()));
      }
    } catch (apiError) {
      setError(apiError.message || (moduleName === "results" ? "Unable to load authoritative race results." : "Unable to load live admin data."));
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
        await adminApi.approveRegistration(id, note || "Race registration approved");
        await load();
        return true;
      }

      if (actionLabel === "Reject") {
        await adminApi.rejectRegistration(id, note || "Race registration rejected");
        await load();
        return true;
      }
    }

    if (moduleName === "results") {
      if (actionLabel === "Confirm") {
        await adminApi.confirmRaceResults(id);
        await load();
        return true;
      }
      if (actionLabel === "Publish") {
        await adminApi.publishRaceResults(id);
        await load();
        return true;
      }
    }

    return false;
  }, [load, moduleName, supportsLiveData]);

  const getRowDetail = useCallback(async (id) => {
    if (moduleName === "users") {
      return adaptAdminUserDetail(await adminApi.getUser(id));
    }

    if (moduleName === "registrations") {
      return adaptRaceRegistrationDetail(await adminApi.getRegistration(id));
    }

    if (moduleName === "results") {
      return adaptAdminRaceResultDetail(await adminApi.listRaceResults({ race_id: id }));
    }

    return null;
  }, [moduleName]);

  const assignRole = useCallback(async (id, roleName) => {
    await adminApi.assignUserRole(id, roleName);
    await load();
    return getRowDetail(id);
  }, [getRowDetail, load]);

  const removeRole = useCallback(async (id, roleName) => {
    await adminApi.removeUserRole(id, roleName);
    await load();
    return getRowDetail(id);
  }, [getRowDetail, load]);

  return {
    liveData,
    isLoading,
    error,
    reload: load,
    applyRowAction,
    getRowDetail,
    assignRole,
    removeRole,
    supportsLiveData,
  };
}
