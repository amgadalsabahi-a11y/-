"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative bg-[#050B18] min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <FAQ />
      <Footer />
    </main>
  );
}
