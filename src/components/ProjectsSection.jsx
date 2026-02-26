import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectsSection = () => {
  const projects = [
    {
      title: 'Juego de Bingo Interactivo',
      description:
        'Aplicación completa de Bingo con cartones generados aleatoriamente, sistema de números cantados y interfaz intuitiva. Incluye controles de juego y seguimiento de progreso.',
      tags: ['React', 'Custom Hooks', 'Tailwind CSS', 'FontAwesome'],
      demoUrl: '/bingo',
      isInternal: true
    },
    {
      title: 'Juego del Siglo - Multijugador',
      description:
        'Juego de apuestas estilo póker con vistas individuales para cada jugador. Sistema de sincronización en tiempo real, vista de administrador y privacidad total entre jugadores.',
      tags: ['React', 'BroadcastChannel', 'Context API', 'LocalStorage'],
      demoUrl: '/fichas',
      isInternal: true
    },
    {
      title: 'Sistema de Reservas de Canchas',
      description:
        'Sistema completo para la gestión de reservas de canchas de fútbol sintético. Incluye landing page, formulario de reserva en 3 pasos, panel de administración con estadísticas y gestión de horarios y precios.',
      tags: ['React', 'Context API', 'Tailwind CSS', 'Responsive'],
      demoUrl: '/reservas',
      isInternal: true
    },
    {
      title: 'Plataforma de E-Learning',
      description:
        'Sistema completo para la gestión de cursos online, usuarios y progreso. Incluye pasarela de pago y foros de discusión en tiempo real.',
      tags: ['Next.js', 'Node.js (NestJS)', 'PostgreSQL', 'Tailwind CSS'],
    },
    {
      title: 'App de Gestión de Tareas (PWA)',
      description:
        'Aplicación web progresiva (PWA) para la organización de tareas personales y de equipo. Soporta modo offline y sincronización en tiempo real.',
      tags: ['React', 'Firebase/Firestore', 'TypeScript', 'Zustand'],
    },
    {
      title: 'Sistema de Inventario para Retail',
      description:
        'Backend escalable para el seguimiento de inventario, órdenes de compra y gestión de proveedores. Optimizado para alto tráfico de datos.',
      tags: ['Python (Django)', 'MongoDB', 'Docker', 'Swagger API'],
    },
  ];

  return (
    <section id="proyectos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Proyectos Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              description={project.description}
              tags={project.tags}
              demoUrl={project.demoUrl}
              isInternal={project.isInternal}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
