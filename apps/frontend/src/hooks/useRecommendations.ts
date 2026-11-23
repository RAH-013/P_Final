import {
  getNextRecommendation,
  getPreviousRecommendations,
  getRecommendationById,
} from "../api/services/recommendations";

import type { RecommendationType } from "../api/services/recommendations";
import { useApiRequest } from "./useApiRequest";

export function useRecommendations() {
  const previousRequest = useApiRequest(getPreviousRecommendations);
  const nextRequest = useApiRequest(getNextRecommendation);
  const detailRequest = useApiRequest(getRecommendationById);

  const fetchPrevious = async () => {
    return previousRequest.execute();
  };

  const fetchNext = async (type: RecommendationType = "all") => {
    return nextRequest.execute(type);
  };

  const fetchById = async (id: number) => {
    return detailRequest.execute(id);
  };

  return {
    previous: previousRequest.data,
    next: nextRequest.data,
    recommendation: detailRequest.data,

    fetchPrevious,
    fetchNext,
    fetchById,

    loading:
      previousRequest.loading || nextRequest.loading || detailRequest.loading,

    error: previousRequest.error ?? nextRequest.error ?? detailRequest.error,
  };
}
