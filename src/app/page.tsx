import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getSiteData } from "@/lib/fetchContent";

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function HomePage() {
  const { settings, faqs, services } = await getSiteData();

  return (
    <main className="relative bg-[#050B18] min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero initialData={settings} />
      <About initialData={settings} />
      <HowItWorks />
      <FAQ initialData={faqs} />
      <Footer />
    </main>
  );
}
