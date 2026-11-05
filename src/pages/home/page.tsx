import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import AiStatusStrip from '@/components/feature/AiStatusStrip';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import GamePreview from './components/GamePreview';
import Plans from './components/Plans';
import Faq from './components/Faq';
import CtaSection from './components/CtaSection';
import LiveCodePanel from './components/LiveCodePanel';

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;
    const timer = window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.key]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />
      <main>
        <Hero />
        <AiStatusStrip />
        <Features />
        <HowItWorks />
        <GamePreview />
        <Plans />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
      <LiveCodePanel />
    </div>
  );
}