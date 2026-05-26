import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Waitlist from "@/components/landing/Waitlist";
import Marquee from "@/components/landing/Marquee";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Pricing from "@/components/landing/Pricing";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Waitlist />
        <Marquee />
        <Features />
        <HowItWorks />
        <Stats />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
