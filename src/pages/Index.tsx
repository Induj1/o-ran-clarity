import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { TopologySection } from "@/components/topology/TopologySection";
import { CapacitySection } from "@/components/capacity/CapacitySection";
import { CongestionSection } from "@/components/congestion/CongestionSection";
import { SummarySection } from "@/components/summary/SummarySection";
import { TrafficPatternChart } from "@/components/analysis/TrafficPatternChart";
import { mockAnalysisData } from "@/data/mockData";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeSection, setActiveSection] = useState("topology");
  const data = mockAnalysisData;

  const renderSection = () => {
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
      default:
        return <TopologySection data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Simulator CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10 border-b border-border">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <FlaskConical className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Want to test traffic scenarios? Try the
            </span>
          </div>
          <Link to="/simulator">
            <Button variant="outline" size="sm" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              What-If Simulator
            </Button>
          </Link>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
