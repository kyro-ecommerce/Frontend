import { useEffect, useRef, useState } from "react";
import { recoverRecommendations } from "../../services/user/recommendationRecovery.js";

export function useRecoveringRecommendations(key, load, enabled = true) {
  // Callers own identity/readiness. Public recommendations must not wait for /me.
  const scope = JSON.stringify([key, enabled]);
  const loader = useRef(load);
  loader.current = load;
  const [state, setState] = useState(null);
  const ready = enabled;
  useEffect(() => {
    if (!ready) return;
    const loadForScope = loader.current;
    return recoverRecommendations({
      load: loadForScope,
      publish: (next) => setState({ ...next, scope }),
    });
  }, [scope, ready]);
  // Hide the previous account/product immediately, before effect cleanup runs.
  return state?.scope === scope ? state : { data: null, status: ready ? "loading" : "idle" };
}
