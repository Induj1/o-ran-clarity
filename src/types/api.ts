// API Response Types for O-RAN Fronthaul Optimization

// New format from actual API
export interface RootCauseContributor {
  cell_id: number;
  pct: number;
}

export interface RootCauseEvent {
  time_sec: number;
  contributors: RootCauseContributor[];
}

export interface AnalysisResponse {
  // Topology: link_id -> array of cell_ids
  topology: Record<string, number[]>;
  // Confidence per link
  topology_confidence: Record<string, number>;
  // Outliers (can be empty array or object)
  outliers: Array<{ cell_id: number; link_id: string; reason?: string }> | Record<string, never>;
  // Capacity data
  capacity: {
    no_buffer_gbps: Record<string, number>;
    with_buffer_gbps: Record<string, number>;
  };
  // Bandwidth savings percentage per link
  bandwidth_savings_pct: Record<string, number>;
  // Root cause attribution: link_id -> array of events
  root_cause_attribution: Record<string, RootCauseEvent[]>;
  // Optional: correlation matrix
  correlation_matrix?: {
    cells: number[];
    matrix: number[][];
  };
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
  reason?: string;
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
  return Object.entries(data.topology_confidence).map(([linkId, confidence]) => ({
    link_id: `Link ${linkId}`,
    confidence,
  }));
}

export function transformOutliers(data: AnalysisResponse): Outlier[] {
  if (Array.isArray(data.outliers)) {
    return data.outliers.map((o) => ({
      cell_id: `Cell ${o.cell_id}`,
      link_id: `Link ${o.link_id}`,
      reason: o.reason,
    }));
  }
  return [];
}

export function transformBandwidthSavings(data: AnalysisResponse): BandwidthSaving[] {
  return Object.entries(data.bandwidth_savings_pct).map(([linkId, savings]) => ({
    link_id: `Link ${linkId}`,
    savings_percent: savings,
  }));
}

export function transformCongestionEvents(data: AnalysisResponse): CongestionEvent[] {
  const events: CongestionEvent[] = [];
  
  Object.entries(data.root_cause_attribution).forEach(([linkId, linkEvents]) => {
    linkEvents.forEach((event) => {
      events.push({
        timestamp: event.time_sec,
        link_id: `Link ${linkId}`,
        contributors: event.contributors.map((c) => ({
          cell_id: `Cell ${c.cell_id}`,
          contribution_percent: c.pct,
        })),
      });
    });
  });
  
  return events.sort((a, b) => a.timestamp - b.timestamp);
}
