import HeroSection from "@/components/HeroSection";
import QuienesSomosSection from "@/components/QuienesSomosSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import ClientsSection from "@/components/ClientsSection";
import ProgramasSection from "@/components/ProgramasSection";
import AuditsSection from "@/components/AuditsSection";
import AuditoriasSection from "@/components/AuditoriasSection";
import BienestarSection from "@/components/BienestarSection";
import FormacionSection from "@/components/FormacionSection";
import CertificationsSection from "@/components/CertificationsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <QuienesSomosSection />
      <AuditsSection />
      <FormacionSection />
      <ServicesSection />
      <AuditoriasSection />
      <BienestarSection />
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
