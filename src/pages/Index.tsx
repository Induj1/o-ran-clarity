import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { TopologySection } from "@/components/topology/TopologySection";
import { CapacitySection } from "@/components/capacity/CapacitySection";
import { CongestionSection } from "@/components/congestion/CongestionSection";
import { SummarySection } from "@/components/summary/SummarySection";
import { mockAnalysisData } from "@/data/mockData";

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
        return <CongestionSection data={data} />;
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
      
      <main className="container mx-auto px-6 py-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
