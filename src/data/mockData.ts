import { AnalysisResponse } from "@/types/api";

// Mock data representing the API response structure
export const mockAnalysisData: AnalysisResponse = {
  topology: {
    links: [
      { link_id: "Link 1", cells: ["Cell 3", "Cell 7", "Cell 12", "Cell 15"] },
      { link_id: "Link 2", cells: ["Cell 1", "Cell 5", "Cell 20", "Cell 22"] },
      { link_id: "Link 3", cells: ["Cell 8", "Cell 11", "Cell 14", "Cell 18", "Cell 19"] },
    ],
  },
  confidence: [
    { link_id: "Link 1", confidence: 94.2 },
    { link_id: "Link 2", confidence: 87.5 },
    { link_id: "Link 3", confidence: 96.8 },
  ],
  outliers: [
    { cell_id: "Cell 22", link_id: "Link 2", reason: "Weaker correlation with link traffic pattern" },
  ],
  capacities: {
    no_buffer: {
      "Link 1": 25.4,
      "Link 2": 31.2,
      "Link 3": 28.7,
    },
    with_buffer: {
      "Link 1": 21.8,
      "Link 2": 24.3,
      "Link 3": 22.4,
    },
  },
  bandwidth_savings: [
    { link_id: "Link 1", savings_percent: 14.2 },
    { link_id: "Link 2", savings_percent: 22.1 },
    { link_id: "Link 3", savings_percent: 21.9 },
  ],
  root_cause_attribution: {
    events: [
      {
        timestamp: 1.06,
        link_id: "Link 2",
        contributors: [
          { cell_id: "Cell 20", contribution_percent: 22.8 },
          { cell_id: "Cell 1", contribution_percent: 21.1 },
          { cell_id: "Cell 5", contribution_percent: 18.4 },
          { cell_id: "Cell 22", contribution_percent: 12.3 },
        ],
      },
      {
        timestamp: 2.34,
        link_id: "Link 1",
        contributors: [
          { cell_id: "Cell 12", contribution_percent: 31.2 },
          { cell_id: "Cell 3", contribution_percent: 24.5 },
          { cell_id: "Cell 7", contribution_percent: 19.8 },
          { cell_id: "Cell 15", contribution_percent: 11.2 },
        ],
      },
      {
        timestamp: 3.89,
        link_id: "Link 3",
        contributors: [
          { cell_id: "Cell 18", contribution_percent: 28.9 },
          { cell_id: "Cell 14", contribution_percent: 25.3 },
          { cell_id: "Cell 11", contribution_percent: 18.7 },
          { cell_id: "Cell 8", contribution_percent: 15.1 },
          { cell_id: "Cell 19", contribution_percent: 8.4 },
        ],
      },
      {
        timestamp: 5.12,
        link_id: "Link 2",
        contributors: [
          { cell_id: "Cell 1", contribution_percent: 35.6 },
          { cell_id: "Cell 20", contribution_percent: 28.2 },
          { cell_id: "Cell 5", contribution_percent: 14.9 },
          { cell_id: "Cell 22", contribution_percent: 9.8 },
        ],
      },
    ],
  },
};
