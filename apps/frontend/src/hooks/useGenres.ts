import { getMyGenres, updateMyGenres } from "../api/services/genres";
import { useApiRequest } from "./useApiRequest";

export function useGenres() {
  const getRequest = useApiRequest(getMyGenres);
  const updateRequest = useApiRequest(updateMyGenres);

  const fetchGenres = async () => {
    const response = await getRequest.execute();
    return response.data;
  };

  const saveGenres = async (genres: string[]) => {
    const response = await updateRequest.execute({ genres });
    return response.data;
  };

  return {
    genres: getRequest.data?.data ?? updateRequest.data?.data ?? [],
    fetchGenres,
    saveGenres,
    loading: getRequest.loading || updateRequest.loading,
    error: getRequest.error ?? updateRequest.error,
  };
}
