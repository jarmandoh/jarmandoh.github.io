import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import SkillsSection from '../components/SkillsSection';
import ProjectsSection from '../components/ProjectsSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  useEffect(() => {
    document.title = 'Inicio | Mi Portafolio';
  }, []);

  return (
    <div className="w-full">
      <Hero />
      <About />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  )
}