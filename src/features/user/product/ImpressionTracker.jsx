import React, { useEffect, useRef } from "react";
import { firstImpression, sendRecommendationEvent } from "../../../services/user/recommendationExposure.js";

// Reports one IMPRESSION when the wrapped recommendation card is at least half
// visible; a re-render or remount of the same (list, product) pair sends nothing.
const ImpressionTracker = ({ tracking, productId, children }) => {
  const ref = useRef(null);
  const recommendationId = tracking?.recommendationId;
  const position = tracking?.position;

  useEffect(() => {
    if (!tracking || !productId || !ref.current) return undefined;
    const report = () => {
      if (firstImpression(recommendationId, productId)) {
        sendRecommendationEvent("IMPRESSION", productId, tracking);
      }
    };
    if (typeof IntersectionObserver === "undefined") {
      report();
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        report();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [recommendationId, position, productId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} className="w-full h-full">{children}</div>;
};

export default ImpressionTracker;
