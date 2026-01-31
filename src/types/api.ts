// API Response Types for O-RAN Fronthaul Optimization
// Aligned with actual backend API response format

// Contribution in root cause attribution
export interface Contribution {
  cell: number;
  percentage: number;
}

// Root cause event
export interface RootCauseEvent {
  time: number;
  contributions: Contribution[];
}

// Outlier info per link
export interface OutlierInfo {
  cell_id: number;
  max_corr: number;
}

// Traffic pattern per link
export interface TrafficPattern {
  time_seconds: number[];
  data_rate_gbps: number[];
}

// Main API response interface
export interface AnalysisResponse {
  // Topology: link_id -> array of cell_ids
  topology: Record<string, number[]>;
  // 2D correlation matrix (flat array of arrays)
  correlation_matrix: number[][];
  // Array of cell IDs in correlation matrix order
  cells: number[];
  // Confidence per link (renamed from topology_confidence)
  confidence: Record<string, number>;
  // Outliers: link_id -> outlier info object
  outliers: Record<string, OutlierInfo>;
  // Capacity data (renamed from capacity)
  capacities: {
    no_buffer: Record<string, number>;
    with_buffer: Record<string, number>;
  };
  // Bandwidth savings percentage per link (renamed from bandwidth_savings_pct)
  bandwidth_savings: Record<string, number>;
  // Traffic patterns per link
  traffic_patterns: Record<string, TrafficPattern>;
  // Root cause attribution: link_id -> array of events
  root_cause_attribution: Record<string, RootCauseEvent[]>;
}

// Helper types for transformed data used in components
export interface TopologyLink {
  link_id: string;
  cells: string[];
}

export interface TopologyConfidence {
  link_id: string;
  confidence: number;
}

export interface Outlier {
  cell_id: string;
  link_id: string;
  max_corr?: number;
}

export interface BandwidthSaving {
  link_id: string;
  savings_percent: number;
}

export interface CongestionContributor {
  cell_id: string;
  contribution_percent: number;
}

export interface CongestionEvent {
  timestamp: number;
  link_id: string;
  contributors: CongestionContributor[];
}

// Utility functions to transform API data to component-friendly format
export function transformTopology(data: AnalysisResponse): TopologyLink[] {
  return Object.entries(data.topology).map(([linkId, cells]) => ({
    link_id: `Link ${linkId}`,
    cells: cells.map((c) => `Cell ${c}`),
  }));
}

export function transformConfidence(data: AnalysisResponse): TopologyConfidence[] {
  return Object.entries(data.confidence).map(([linkId, confidence]) => ({
    link_id: `Link ${linkId}`,
    confidence,
  }));
}

export function transformOutliers(data: AnalysisResponse): Outlier[] {
  return Object.entries(data.outliers).map(([linkId, info]) => ({
    cell_id: `Cell ${info.cell_id}`,
    link_id: `Link ${linkId}`,
    max_corr: info.max_corr,
  }));
}

export function transformBandwidthSavings(data: AnalysisResponse): BandwidthSaving[] {
  return Object.entries(data.bandwidth_savings).map(([linkId, savings]) => ({
    link_id: `Link ${linkId}`,
    savings_percent: savings,
  }));
}

export function transformCongestionEvents(data: AnalysisResponse): CongestionEvent[] {
  const events: CongestionEvent[] = [];
  
  Object.entries(data.root_cause_attribution).forEach(([linkId, linkEvents]) => {
    linkEvents.forEach((event) => {
      events.push({
        timestamp: event.time,
        link_id: `Link ${linkId}`,
        contributors: event.contributions.map((c) => ({
          cell_id: `Cell ${c.cell}`,
          contribution_percent: c.percentage,
        })),
      });
    });
  });
  
  return events.sort((a, b) => a.timestamp - b.timestamp);
}
