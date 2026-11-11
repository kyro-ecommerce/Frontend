import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../store/user/AuthContext";
import { recoverRecommendations } from "../../services/user/recommendationRecovery.js";

export function useRecoveringRecommendations(key, load, enabled = true) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const userId = user?.id ?? user?.userId ?? user?.user_id;
  const actor = isAuthenticated ? `user:${userId}` : "guest";
  const scope = JSON.stringify([key, actor, !!authLoading, enabled]);
  const loader = useRef(load);
  loader.current = load;
  const [state, setState] = useState(null);
  const ready = enabled && !authLoading;
  useEffect(() => {
    if (!ready) return;
    return recoverRecommendations({
      load: (signal) => loader.current(signal),
      publish: (next) => setState({ ...next, scope }),
    });
  }, [scope, ready]);
  // Hide the previous account/product immediately, before effect cleanup runs.
  return state?.scope === scope ? state : { data: null, status: ready ? "loading" : "idle" };
}
