import { AnalysisResponse } from "@/types/api";

// Mock data representing the actual API response structure
export const mockAnalysisData: AnalysisResponse = {
  topology: {
    "1": [4],
    "2": [1, 3, 5, 9, 11, 12, 14, 17, 20, 21, 22],
    "3": [2, 6, 7, 8, 10, 13, 15, 16, 18, 19, 23, 24],
  },
  topology_confidence: {
    "1": 67,
    "2": 61,
    "3": 87,
  },
  outliers: [],
  capacity: {
    no_buffer_gbps: {
      "1": 6.77,
      "2": 31.05,
      "3": 56.57,
    },
    with_buffer_gbps: {
      "1": 5.27,
      "2": 24.16,
      "3": 44.0,
    },
  },
  bandwidth_savings_pct: {
    "1": 22,
    "2": 22,
    "3": 22,
  },
  root_cause_attribution: {
    "1": [
      { time_sec: 1.05, contributors: [{ cell_id: 4, pct: 100.0 }] },
      { time_sec: 1.05, contributors: [{ cell_id: 4, pct: 100.0 }] },
      { time_sec: 1.05, contributors: [{ cell_id: 4, pct: 100.0 }] },
    ],
    "2": [
      { time_sec: 1.06, contributors: [{ cell_id: 20, pct: 22.8 }, { cell_id: 1, pct: 21.1 }] },
      { time_sec: 1.06, contributors: [{ cell_id: 1, pct: 22.5 }, { cell_id: 20, pct: 22.5 }] },
      { time_sec: 1.06, contributors: [{ cell_id: 20, pct: 23.1 }, { cell_id: 1, pct: 21.4 }] },
      { time_sec: 2.15, contributors: [{ cell_id: 5, pct: 18.2 }, { cell_id: 9, pct: 15.8 }] },
      { time_sec: 3.22, contributors: [{ cell_id: 12, pct: 25.4 }, { cell_id: 14, pct: 19.1 }] },
    ],
    "3": [
      { time_sec: 1.01, contributors: [{ cell_id: 15, pct: 17.6 }, { cell_id: 2, pct: 12.2 }] },
      { time_sec: 1.02, contributors: [{ cell_id: 15, pct: 15.8 }, { cell_id: 2, pct: 14.7 }] },
      { time_sec: 1.02, contributors: [{ cell_id: 15, pct: 17.9 }, { cell_id: 2, pct: 14.9 }] },
      { time_sec: 2.45, contributors: [{ cell_id: 8, pct: 22.1 }, { cell_id: 10, pct: 18.3 }] },
      { time_sec: 3.67, contributors: [{ cell_id: 19, pct: 28.5 }, { cell_id: 23, pct: 16.2 }] },
    ],
  },
};
