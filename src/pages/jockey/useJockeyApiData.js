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
      const [me, approvalStatus, assignments, schedule, results, stats, violations] = await Promise.all([
        jockeyApi.getMe(),
        jockeyApi.getApprovalStatus(),
        jockeyApi.getAssignments(),
        jockeyApi.getSchedule(),
        jockeyApi.getResults(),
        jockeyApi.getStats(),
        jockeyApi.getViolations(),
      ]);

      setState(adaptJockeyApiData({
        me,
        approvalStatus,
        assignments,
        schedule,
        results,
        stats,
        violations,
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

  const respondToMeeting = useCallback(async (id, accepted) => {
    const action = accepted ? jockeyApi.acceptAppointment : jockeyApi.rejectAppointment;
    await action(id, accepted ? "Appointment accepted" : "Appointment rejected");
    await loadJockeyData();
  }, [loadJockeyData]);

  const respondToContract = useCallback(async (id, accepted) => {
    const action = accepted ? jockeyApi.confirmContract : jockeyApi.rejectContract;
    await action(id, accepted ? "Contract confirmed" : "Contract rejected");
    await loadJockeyData();
  }, [loadJockeyData]);

  const updateProfile = useCallback(async (payload) => {
    await jockeyApi.updateMe(payload);
    await loadJockeyData();
  }, [loadJockeyData]);

  return {
    ...state,
    isLoading,
    error,
    reload: loadJockeyData,
    respondToMeeting,
    respondToContract,
    updateProfile,
  };
}
