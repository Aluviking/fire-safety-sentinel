import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import ClientsSection from "@/components/ClientsSection";
import ProgramasSection from "@/components/ProgramasSection";
import AuditsSection from "@/components/AuditsSection";
import FormacionSection from "@/components/FormacionSection";
import CertificationsSection from "@/components/CertificationsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <AuditsSection />
      <FormacionSection />
      <ServicesSection />
      <ProgramasSection />
      <CertificationsSection />
      <TestimonialsSection />
      <CTASection />
      <StatsSection />
      <ClientsSection />
      <Footer />
    </div>
  );
};

export default Index;
