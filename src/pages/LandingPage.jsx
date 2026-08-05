import LandingNavbar from "../components/LandingNavbar";
import HeroSection from "../components/HeroSection";
import MetricsSection from "../components/MetricsSection";
import AboutSection from "../components/AboutSection";
import FeaturesSection from "../components/FeaturesSection";
import DashboardPreview from "../components/DashboardPreview";
import TimelineSection from "../components/TimelineSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <HeroSection />
      <MetricsSection />
      <AboutSection />
      <FeaturesSection />
      <DashboardPreview />
      <TimelineSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </>
  );
}

export default LandingPage; 