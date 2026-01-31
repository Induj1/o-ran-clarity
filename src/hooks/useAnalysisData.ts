import { useQuery } from "@tanstack/react-query";
import { AnalysisResponse } from "@/types/api";

const API_BASE_URL = "https://cdd06d042eca.ngrok-free.app";

async function fetchAnalysisData(): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // ngrok requires this header to bypass the browser warning page
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export function useAnalysisData() {
  return useQuery({
    queryKey: ["analysis-data"],
    queryFn: fetchAnalysisData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
