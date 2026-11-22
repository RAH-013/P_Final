import {
  getCatalogDetails,
  getFeaturedCatalog,
  searchCatalog,
} from "../api/services/catalog";

import type { CatalogDetailsParams } from "../api/services/catalog";
import type { CatalogItem } from "../api/types";
import { useApiRequest } from "./useApiRequest";

export function useCatalog() {
  const searchRequest = useApiRequest(searchCatalog);
  const featuredRequest = useApiRequest(getFeaturedCatalog);
  const detailsRequest = useApiRequest(getCatalogDetails);

  const search = async (q: string) => {
    return searchRequest.execute({ q });
  };

  const fetchFeatured = async () => {
    return featuredRequest.execute();
  };

  const fetchDetails = async (
    id: string,
    params: CatalogDetailsParams = {},
  ) => {
    return detailsRequest.execute(id, params);
  };

  return {
    results: searchRequest.data ?? [],
    featured: featuredRequest.data,
    details: detailsRequest.data as CatalogItem | null,

    search,
    fetchFeatured,
    fetchDetails,

    loading:
      searchRequest.loading ||
      featuredRequest.loading ||
      detailsRequest.loading,

    error: searchRequest.error ?? featuredRequest.error ?? detailsRequest.error,
  };
}
