import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { NetworkBackground } from "@/components/layout/NetworkBackground";
import { mockAnalysisData } from "@/data/mockData";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Play, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Radio,
  Hexagon
} from "lucide-react";
import { Link } from "react-router-dom";

interface TrafficModification {
  cellId: number;
  changePercent: number;
}

const Simulator = () => {
  const data = mockAnalysisData;
  const allCells = useMemo(() => {
    const cells = new Set<number>();
    Object.values(data.topology).forEach((linkCells) => {
      linkCells.forEach((cell) => cells.add(cell));
    });
    return Array.from(cells).sort((a, b) => a - b);
  }, [data]);

  const [modifications, setModifications] = useState<TrafficModification[]>([]);
  const [simulationRun, setSimulationRun] = useState(false);

  const getCellLink = (cellId: number): string | null => {
    for (const [linkId, cells] of Object.entries(data.topology)) {
      if (cells.includes(cellId)) return linkId;
    }
    return null;
  };

  const updateModification = (cellId: number, changePercent: number) => {
    setSimulationRun(false);
    setModifications((prev) => {
      const existing = prev.findIndex((m) => m.cellId === cellId);
      if (changePercent === 0) {
        return prev.filter((m) => m.cellId !== cellId);
      }
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { cellId, changePercent };
        return updated;
      }
      return [...prev, { cellId, changePercent }];
    });
  };

  const resetAll = () => {
    setModifications([]);
    setSimulationRun(false);
  };

  const runSimulation = () => {
    setSimulationRun(true);
  };

  // Calculate simulated impact
  const simulatedImpact = useMemo(() => {
    if (!simulationRun || modifications.length === 0) return null;

    const impactByLink: Record<string, { 
      capacityChange: number; 
      congestionRisk: "low" | "medium" | "high";
      affectedCells: number[];
    }> = {};

    Object.entries(data.topology).forEach(([linkId, cells]) => {
      const relevantMods = modifications.filter((m) => cells.includes(m.cellId));
      const totalChange = relevantMods.reduce((sum, m) => sum + m.changePercent, 0);
      
      // Simulate capacity impact
      const baseCapacity = data.capacity.with_buffer_gbps[linkId] || 0;
      const capacityChange = (totalChange / 100) * baseCapacity * 0.3;
      
      // Determine congestion risk
      let congestionRisk: "low" | "medium" | "high" = "low";
      if (totalChange > 30) congestionRisk = "high";
      else if (totalChange > 10) congestionRisk = "medium";

      impactByLink[linkId] = {
        capacityChange,
        congestionRisk,
        affectedCells: relevantMods.map((m) => m.cellId),
      };
    });

    return impactByLink;
  }, [simulationRun, modifications, data]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated network background */}
      <NetworkBackground />
      
      <div className="relative z-10">
        <Header />
        
        {/* Navigation Back */}
        <div className="border-b border-border/50 bg-card/20 backdrop-blur-md">
          <div className="container mx-auto px-6 py-3">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Analysis
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary/30 blur-xl rounded-full" />
                <div className="relative p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/30 animate-glow-pulse">
                  <FlaskConical className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-display tracking-wide">
                  What-If <span className="text-accent">Simulator</span>
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Hexagon className="w-3 h-3 text-primary" />
                  Simulate traffic changes and predict network impact
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={resetAll} 
                className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/10"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </Button>
              <Button 
                onClick={runSimulation} 
                disabled={modifications.length === 0} 
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 border-0 shadow-lg shadow-primary/20"
              >
                <Play className="w-4 h-4" />
                Run Simulation
              </Button>
            </div>
          </div>

        {/* Active Modifications Summary */}
        {modifications.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Active Modifications:</span>
                {modifications.map((mod) => (
                  <Badge
                    key={mod.cellId}
                    variant={mod.changePercent > 0 ? "default" : "secondary"}
                    className="gap-1"
                  >
                    Cell {mod.cellId}
                    {mod.changePercent > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {mod.changePercent > 0 ? "+" : ""}
                    {mod.changePercent}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cell Traffic Controls */}
          <Card className="section-card border-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Radio className="w-5 h-5 text-accent" />
                Cell Traffic Adjustments
              </CardTitle>
              <CardDescription>
                Adjust traffic levels for individual cells to see predicted network impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
              {allCells.map((cellId) => {
                const linkId = getCellLink(cellId);
                const currentMod = modifications.find((m) => m.cellId === cellId);
                const changePercent = currentMod?.changePercent || 0;

                return (
                  <div
                    key={cellId}
                    className={`p-4 rounded-lg border transition-all ${
                      changePercent !== 0
                        ? "border-accent/50 bg-accent/5 shadow-lg shadow-accent/10"
                        : "border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono ${
                            changePercent !== 0 
                              ? "bg-gradient-to-br from-accent/30 to-primary/30 text-accent border border-accent/30" 
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                          style={{ boxShadow: changePercent !== 0 ? '0 0 15px hsl(180 100% 45% / 0.3)' : undefined }}
                        >
                          {cellId}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Cell {cellId}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Hexagon className="w-3 h-3 text-secondary" />
                            Link {linkId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {changePercent !== 0 && (
                          <Badge 
                            className={`gap-1 ${
                              changePercent > 0 
                                ? "bg-[hsl(var(--status-low))]/20 text-[hsl(var(--status-low))] border-[hsl(var(--status-low))]/30" 
                                : "bg-[hsl(var(--status-high))]/20 text-[hsl(var(--status-high))] border-[hsl(var(--status-high))]/30"
                            }`}
                          >
                            {changePercent > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {changePercent > 0 ? "+" : ""}
                            {changePercent}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground w-8 font-mono">-50%</span>
                      <Slider
                        value={[changePercent]}
                        onValueChange={([v]) => updateModification(cellId, v)}
                        min={-50}
                        max={50}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 font-mono">+50%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Simulation Results */}
          <Card className="section-card border-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <TrendingUp className="w-5 h-5 text-accent" />
                Simulation Results
              </CardTitle>
              <CardDescription>
                Predicted impact on network links based on traffic modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!simulationRun ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <FlaskConical className="relative w-16 h-16 opacity-40 text-primary" />
                  </div>
                  <p className="text-lg font-medium font-display">No simulation running</p>
                  <p className="text-sm">
                    Adjust cell traffic levels and click "Run Simulation" to see predictions
                  </p>
                </div>
              ) : simulatedImpact ? (
                <div className="space-y-4">
                  {Object.entries(simulatedImpact).map(([linkId, impact]) => (
                    <div
                      key={linkId}
                      className={`p-4 rounded-lg border ${
                        impact.congestionRisk === "high"
                          ? "border-[hsl(var(--status-low))] bg-[hsl(var(--status-low-bg))]"
                          : impact.congestionRisk === "medium"
                          ? "border-[hsl(var(--status-medium))] bg-[hsl(var(--status-medium-bg))]"
                          : "border-[hsl(var(--status-high))] bg-[hsl(var(--status-high-bg))]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Link {linkId}</span>
                          <Badge
                            variant="outline"
                            className={
                              impact.congestionRisk === "high"
                                ? "border-[hsl(var(--status-low))] text-[hsl(var(--status-low))]"
                                : impact.congestionRisk === "medium"
                                ? "border-[hsl(var(--status-medium))] text-[hsl(var(--status-medium))]"
                                : "border-[hsl(var(--status-high))] text-[hsl(var(--status-high))]"
                            }
                          >
                            {impact.congestionRisk === "high" && (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {impact.congestionRisk === "low" && (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            )}
                            {impact.congestionRisk.charAt(0).toUpperCase() + impact.congestionRisk.slice(1)} Risk
                          </Badge>
                        </div>
                        <span
                          className={`font-mono font-medium ${
                            impact.capacityChange > 0 ? "text-[hsl(var(--status-low))]" : "text-[hsl(var(--status-high))]"
                          }`}
                        >
                          {impact.capacityChange > 0 ? "+" : ""}
                          {impact.capacityChange.toFixed(2)} Gbps
                        </span>
                      </div>
                      {impact.affectedCells.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Affected cells:{" "}
                          {impact.affectedCells.map((c) => `Cell ${c}`).join(", ")}
                        </div>
                      )}
                      
                      {/* Visual capacity bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Current capacity</span>
                          <span>{data.capacity.with_buffer_gbps[linkId]?.toFixed(1)} Gbps</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              impact.congestionRisk === "high"
                                ? "bg-[hsl(var(--status-low))]"
                                : impact.congestionRisk === "medium"
                                ? "bg-[hsl(var(--status-medium))]"
                                : "bg-[hsl(var(--status-high))]"
                            }`}
                            style={{
                              width: `${Math.min(100, 70 + (impact.capacityChange / (data.capacity.with_buffer_gbps[linkId] || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Predicted</span>
                          <span
                            className={
                              impact.capacityChange > 0 ? "text-[hsl(var(--status-low))]" : "text-[hsl(var(--status-high))]"
                            }
                          >
                            {((data.capacity.with_buffer_gbps[linkId] || 0) + impact.capacityChange).toFixed(1)} Gbps
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Overall Summary */}
                  <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                    <h4 className="font-medium text-foreground mb-2">Simulation Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {Object.values(simulatedImpact).some((i) => i.congestionRisk === "high")
                        ? "⚠️ Warning: Some links may experience congestion with these traffic changes. Consider load balancing or capacity upgrades."
                        : Object.values(simulatedImpact).some((i) => i.congestionRisk === "medium")
                        ? "📊 Moderate impact detected. Monitor these links during peak hours."
                        : "✅ Traffic changes appear manageable within current network capacity."}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Simulator;
