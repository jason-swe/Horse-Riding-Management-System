import { useCallback, useEffect, useState } from "react";
import { ownerApi } from "../../api/ownerApi";
import { useAuth } from "../../auth/AuthContext";
import { toOwnerHorse, toOwnerProfile } from "./ownerAdapters";

export function useOwnerHorses() {
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHorses = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await ownerApi.getHorses();
      setHorses((data.horses || []).map(toOwnerHorse));
    } catch (apiError) {
      setError(apiError.message || "Unable to load horses.");
      setHorses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHorses();
  }, [loadHorses]);

  return { horses, isLoading, error, reload: loadHorses };
}

export function useOwnerHorse(horseId) {
  const [horse, setHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(horseId));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHorse() {
      if (!horseId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await ownerApi.getHorse(horseId);
        if (!cancelled) {
          setHorse(toOwnerHorse(data.horse));
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(apiError.message || "Unable to load horse.");
          setHorse(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHorse();

    return () => {
      cancelled = true;
    };
  }, [horseId]);

  return { horse, isLoading, error };
}

export function useOwnerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const data = await ownerApi.getProfile();
        if (!cancelled) {
          setProfile(toOwnerProfile(data.profile, user));
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(apiError.message || "Unable to load owner profile.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, isLoading, error };
}
