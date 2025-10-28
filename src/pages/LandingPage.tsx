import { useEffect } from "react";
import LandingNav from "../components/landing/LandingNav";
import Hero from "../components/landing/Hero";
import BenefitsSection from "../components/landing/BenefitsSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import PlansPreview from "../components/landing/PlansPreview";
import TrustSection from "../components/landing/TrustSection";
import AgentNetworkSection from "../components/landing/AgentNetworkSection";
import LandingFooter from "../components/landing/LandingFooter";

const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll behavior for anchor links
    const smoothScroll = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement;
      if (!target) return;

      const href = target.getAttribute("href");
      if (href && href.startsWith("#")) {
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          const navHeight = 80; // Height of fixed nav
          const elementPosition = element.offsetTop;
          const offsetPosition = elementPosition - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", smoothScroll);
    return () => document.removeEventListener("click", smoothScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <LandingNav />
      <Hero />
      <section id="why-us">
        <div className="bg-white py-8">
          <BenefitsSection />
        </div>
        <div className="bg-gray-50 py-8">
          <HowItWorksSection />
        </div>
      </section>
      <section id="plans" className="scroll-mt-20">
        <PlansPreview />
      </section>
      <TrustSection />
      <AgentNetworkSection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
