import { useCallback, useEffect, useState } from "react";
import { jockeyApi } from "../../api/jockeyApi";
import { useAuth } from "../../auth/AuthContext";
import { adaptJockeyApiData } from "./jockeyAdapters";

export function useJockeyApiData() {
  const { user } = useAuth();
  const [state, setState] = useState(() => adaptJockeyApiData({ user }));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJockeyData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [me, approvalStatus, assignments, schedule, results, stats] = await Promise.all([
        jockeyApi.getMe(),
        jockeyApi.getApprovalStatus(),
        jockeyApi.getAssignments(),
        jockeyApi.getSchedule(),
        jockeyApi.getResults(),
        jockeyApi.getStats(),
      ]);

      setState(adaptJockeyApiData({
        me,
        approvalStatus,
        assignments,
        schedule,
        results,
        stats,
        user,
      }));
    } catch (apiError) {
      setError(apiError.message || "Unable to load live jockey data. Showing sample workspace data.");
      setState(adaptJockeyApiData({ user }));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadJockeyData();
  }, [loadJockeyData]);

  const respondToAssignment = useCallback(async (id, status) => {
    const action = status === "Accepted" ? jockeyApi.acceptAssignment : jockeyApi.rejectAssignment;
    await action(id, status);
    await loadJockeyData();
  }, [loadJockeyData]);

  return {
    ...state,
    isLoading,
    error,
    reload: loadJockeyData,
    respondToAssignment,
  };
}
