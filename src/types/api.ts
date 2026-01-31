// API Response Types for O-RAN Fronthaul Optimization

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

export interface Topology {
  links: TopologyLink[];
}

export interface Capacities {
  no_buffer: Record<string, number>;
  with_buffer: Record<string, number>;
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

export interface RootCauseAttribution {
  events: CongestionEvent[];
}

export interface AnalysisResponse {
  topology: Topology;
  confidence: TopologyConfidence[];
  outliers: Outlier[];
  capacities: Capacities;
  bandwidth_savings: BandwidthSaving[];
  root_cause_attribution: RootCauseAttribution;
}
