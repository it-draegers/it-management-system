"use client";

import useSWR from "swr";
import { getAssets, type Asset } from "@/lib/actions/assets";

export type AssetFilters = {
  search?: string;
  type?: string;
  status?: string;
  location?: string;
  department?: string;
};

async function fetchAssets(_: string, filters: AssetFilters) {
  const res = await getAssets({
    search: filters.search || undefined,
    type: filters.type || "all",
    status: filters.status || "all",
    location: filters.location || "all",
    department: filters.department || "all",
  });

  if ("error" in res) {
    throw new Error(res.error);
  }

  return res.assets as Asset[];
}

export function useAssets(filters: AssetFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    ["assets", filters],
    fetchAssets,
    {
      refreshInterval: 5000,      
      revalidateOnFocus: true,    
    }
  );

  return {
    assets: data || [],
    isLoading,
    isError: !!error,
    mutate, 
  };
}