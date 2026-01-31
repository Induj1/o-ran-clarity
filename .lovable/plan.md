
# Plan: Align Frontend with Actual Backend API Response Format

## Overview

The current frontend types and mock data use a **different field naming convention** than the actual API. This plan updates the TypeScript types, mock data, and transform functions to match the exact API response format documented in the README.

---

## Key Differences Between Current and Actual API

| Field | Current (Frontend) | Actual (API) |
|-------|-------------------|--------------|
| Confidence | `topology_confidence` | `confidence` |
| Capacity | `capacity.no_buffer_gbps` / `capacity.with_buffer_gbps` | `capacities.no_buffer` / `capacities.with_buffer` |
| Bandwidth Savings | `bandwidth_savings_pct` | `bandwidth_savings` |
| Root Cause Event Time | `time_sec` | `time` |
| Root Cause Contributors | `contributors[].cell_id` / `contributors[].pct` | `contributions[].cell` / `contributions[].percentage` |
| Correlation Matrix | `correlation_matrix.cells` / `correlation_matrix.matrix` | `cells` / `correlation_matrix` (separate top-level fields) |
| Traffic Patterns | Not present | `traffic_patterns` (new field) |

---

## Technical Implementation

### 1. Update Type Definitions
**File:** `src/types/api.ts`

Update the `AnalysisResponse` interface to match the actual API:

```text
interface AnalysisResponse {
  topology: Record<string, number[]>;
  correlation_matrix: number[][];           // Changed: flat 2D array
  cells: number[];                          // Changed: separate top-level field
  confidence: Record<string, number>;       // Renamed from topology_confidence
  outliers: Record<string, OutlierInfo>;    // Changed: object with link_id keys
  capacities: {                             // Renamed from capacity
    no_buffer: Record<string, number>;      // Renamed from no_buffer_gbps
    with_buffer: Record<string, number>;    // Renamed from with_buffer_gbps
  };
  bandwidth_savings: Record<string, number>; // Renamed from bandwidth_savings_pct
  traffic_patterns: Record<string, TrafficPattern>; // New field
  root_cause_attribution: Record<string, RootCauseEvent[]>;
}
```

Update supporting interfaces:

```text
interface OutlierInfo {
  cell_id: number;
  max_corr: number;
}

interface TrafficPattern {
  time_seconds: number[];
  data_rate_gbps: number[];
}

interface RootCauseEvent {
  time: number;               // Renamed from time_sec
  contributions: Contribution[]; // Renamed from contributors
}

interface Contribution {
  cell: number;               // Renamed from cell_id
  percentage: number;         // Renamed from pct
}
```

### 2. Update Mock Data
**File:** `src/data/mockData.ts`

Update mock data to match the new API structure:

```text
export const mockAnalysisData = {
  topology: { "1": [4], "2": [...], "3": [...] },
  correlation_matrix: [[1.0, 0.85, ...], [0.85, 1.0, ...], ...],
  cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  confidence: { "1": 67, "2": 61, "3": 87 },
  outliers: {},
  capacities: {
    no_buffer: { "1": 6.77, "2": 31.05, "3": 56.57 },
    with_buffer: { "1": 5.27, "2": 24.16, "3": 44.0 }
  },
  bandwidth_savings: { "1": 22, "2": 22, "3": 22 },
  traffic_patterns: {
    "1": { time_seconds: [...], data_rate_gbps: [...] },
    "2": { time_seconds: [...], data_rate_gbps: [...] },
    "3": { time_seconds: [...], data_rate_gbps: [...] }
  },
  root_cause_attribution: {
    "2": [{ time: 45.2, contributions: [{ cell: 1, percentage: 45 }, ...] }]
  }
}
```

### 3. Update Transform Functions
**File:** `src/types/api.ts`

Update all transform utility functions to use new field names:

- `transformConfidence`: Access `data.confidence` instead of `data.topology_confidence`
- `transformBandwidthSavings`: Access `data.bandwidth_savings` instead of `data.bandwidth_savings_pct`
- `transformCongestionEvents`: Access `event.time` and `event.contributions` with `.cell` and `.percentage`
- `transformOutliers`: Handle new object structure with `max_corr` field

### 4. Update Components

Update all components that consume the API data:

| Component | Changes Required |
|-----------|-----------------|
| `TopologySection.tsx` | Use `data.confidence` |
| `TopologyGraph.tsx` | Use `data.confidence` |
| `CapacitySection.tsx` | Use `data.capacities.no_buffer` / `data.capacities.with_buffer`, `data.bandwidth_savings` |
| `CapacityChart.tsx` | Use `data.capacities.no_buffer` / `data.capacities.with_buffer`, `data.bandwidth_savings` |
| `CongestionSection.tsx` | Use `event.time`, `event.contributions`, `c.cell`, `c.percentage` |
| `CongestionTimeline.tsx` | Already uses transformed data (no changes) |
| `TrafficPatternChart.tsx` | Use `data.confidence`, `event.contributions`, `c.cell`, `c.percentage`; optionally use real `traffic_patterns` data |
| `ReportSection.tsx` | Use `data.confidence`, `data.capacities`, `data.bandwidth_savings` |
| `SummarySection.tsx` | Use updated field names |

### 5. Update AI Chat Context (Optional Enhancement)
**File:** `supabase/functions/chat/index.ts`

Update the SYSTEM_PROMPT to reference the correct field names so the AI chatbot provides accurate information when answering questions.

---

## Files to Modify

1. `src/types/api.ts` - Type definitions and transforms
2. `src/data/mockData.ts` - Mock data structure
3. `src/components/topology/TopologySection.tsx`
4. `src/components/topology/TopologyGraph.tsx`
5. `src/components/capacity/CapacitySection.tsx`
6. `src/components/capacity/CapacityChart.tsx`
7. `src/components/congestion/CongestionSection.tsx`
8. `src/components/analysis/TrafficPatternChart.tsx`
9. `src/components/report/ReportSection.tsx`
10. `src/components/summary/SummarySection.tsx`
11. `supabase/functions/chat/index.ts` (optional)

---

## Summary

This update ensures the frontend is fully aligned with the actual backend API format. The changes are primarily renaming fields and adjusting data access patterns - no functional changes to the UI or visualizations.
