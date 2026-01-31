import { AnalysisResponse } from "@/types/api";

// Mock data representing the actual API response structure
export const mockAnalysisData: AnalysisResponse = {
  topology: {
    "1": [4],
    "2": [1, 3, 5, 9, 11, 12, 14, 17, 20, 21, 22],
    "3": [2, 6, 7, 8, 10, 13, 15, 16, 18, 19, 23, 24],
  },
  correlation_matrix: [
    [1.0, 0.85, 0.72, 0.65, 0.58, 0.52, 0.48, 0.45, 0.42, 0.38],
    [0.85, 1.0, 0.78, 0.68, 0.62, 0.55, 0.50, 0.47, 0.44, 0.40],
    [0.72, 0.78, 1.0, 0.75, 0.68, 0.60, 0.55, 0.52, 0.48, 0.44],
    [0.65, 0.68, 0.75, 1.0, 0.72, 0.65, 0.60, 0.56, 0.52, 0.48],
    [0.58, 0.62, 0.68, 0.72, 1.0, 0.70, 0.65, 0.60, 0.55, 0.50],
    [0.52, 0.55, 0.60, 0.65, 0.70, 1.0, 0.72, 0.68, 0.62, 0.55],
    [0.48, 0.50, 0.55, 0.60, 0.65, 0.72, 1.0, 0.75, 0.68, 0.60],
    [0.45, 0.47, 0.52, 0.56, 0.60, 0.68, 0.75, 1.0, 0.72, 0.65],
    [0.42, 0.44, 0.48, 0.52, 0.55, 0.62, 0.68, 0.72, 1.0, 0.70],
    [0.38, 0.40, 0.44, 0.48, 0.50, 0.55, 0.60, 0.65, 0.70, 1.0],
  ],
  cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  confidence: {
    "1": 67,
    "2": 61,
    "3": 87,
  },
  outliers: {},
  capacities: {
    no_buffer: {
      "1": 6.77,
      "2": 31.05,
      "3": 56.57,
    },
    with_buffer: {
      "1": 5.27,
      "2": 24.16,
      "3": 44.0,
    },
  },
  bandwidth_savings: {
    "1": 22,
    "2": 22,
    "3": 22,
  },
  traffic_patterns: {
    "1": {
      time_seconds: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
      data_rate_gbps: [4.2, 5.1, 6.8, 5.5, 4.8, 5.2, 6.1, 5.8, 4.9, 5.3, 5.0],
    },
    "2": {
      time_seconds: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
      data_rate_gbps: [22.5, 25.8, 31.2, 28.4, 24.1, 26.5, 29.8, 27.2, 23.8, 25.1, 24.5],
    },
    "3": {
      time_seconds: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
      data_rate_gbps: [42.1, 48.5, 56.8, 52.3, 44.2, 47.8, 54.2, 50.1, 43.5, 46.2, 45.0],
    },
  },
  root_cause_attribution: {
    "1": [
      { time: 1.05, contributions: [{ cell: 4, percentage: 100.0 }] },
      { time: 1.05, contributions: [{ cell: 4, percentage: 100.0 }] },
      { time: 1.05, contributions: [{ cell: 4, percentage: 100.0 }] },
    ],
    "2": [
      { time: 1.06, contributions: [{ cell: 20, percentage: 22.8 }, { cell: 1, percentage: 21.1 }] },
      { time: 1.06, contributions: [{ cell: 1, percentage: 22.5 }, { cell: 20, percentage: 22.5 }] },
      { time: 1.06, contributions: [{ cell: 20, percentage: 23.1 }, { cell: 1, percentage: 21.4 }] },
      { time: 2.15, contributions: [{ cell: 5, percentage: 18.2 }, { cell: 9, percentage: 15.8 }] },
      { time: 3.22, contributions: [{ cell: 12, percentage: 25.4 }, { cell: 14, percentage: 19.1 }] },
    ],
    "3": [
      { time: 1.01, contributions: [{ cell: 15, percentage: 17.6 }, { cell: 2, percentage: 12.2 }] },
      { time: 1.02, contributions: [{ cell: 15, percentage: 15.8 }, { cell: 2, percentage: 14.7 }] },
      { time: 1.02, contributions: [{ cell: 15, percentage: 17.9 }, { cell: 2, percentage: 14.9 }] },
      { time: 2.45, contributions: [{ cell: 8, percentage: 22.1 }, { cell: 10, percentage: 18.3 }] },
      { time: 3.67, contributions: [{ cell: 19, percentage: 28.5 }, { cell: 23, percentage: 16.2 }] },
    ],
  },
};
