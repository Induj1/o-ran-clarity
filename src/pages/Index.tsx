import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { NetworkBackground } from "@/components/layout/NetworkBackground";
import { TopologySection } from "@/components/topology/TopologySection";
import { CapacitySection } from "@/components/capacity/CapacitySection";
import { CongestionSection } from "@/components/congestion/CongestionSection";
import { SummarySection } from "@/components/summary/SummarySection";
import { ReportSection } from "@/components/report/ReportSection";
import { TrafficPatternChart } from "@/components/analysis/TrafficPatternChart";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { FlaskConical, Zap, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeSection, setActiveSection] = useState("topology");
  const { data, isLoading, error } = useAnalysisData();

  const renderSection = () => {
    if (!data) return null;
    
    switch (activeSection) {
      case "topology":
        return <TopologySection data={data} />;
      case "capacity":
        return <CapacitySection data={data} />;
      case "congestion":
        return (
          <div className="space-y-8">
            <CongestionSection data={data} />
            <TrafficPatternChart data={data} />
          </div>
        );
      case "summary":
        return <SummarySection data={data} />;
      case "report":
        return <ReportSection data={data} />;
      default:
        return <TopologySection data={data} />;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading analysis data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-foreground font-medium">Failed to load data</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      );
    }

    return renderSection();
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated network background */}
      <NetworkBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        
        {/* Simulator CTA */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5" />
          <div className="container mx-auto px-6 py-3 flex items-center gap-4 relative">
            <Zap className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              Explore traffic scenarios with the
            </span>
            <Link to="/simulator">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 border-0 shadow-lg shadow-primary/20">
                <FlaskConical className="w-4 h-4" />
                What-If Simulator
              </Button>
            </Link>
          </div>
        </div>
        
        <main className="container mx-auto px-6 py-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
