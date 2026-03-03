import React from 'react';

const About = () => {
  return (
    <section id="acerca" className="py-20 bg-gray-900 text-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Acerca de Mí</h2>
        <div className="text-lg leading-relaxed text-gray-300 space-y-4">
          <p>
            Soy un desarrollador Fullstack con mas de 8 años de experiencia, especializado en el ecosistema JavaScript. Mi enfoque principal es crear aplicaciones robustas, de alto rendimiento y fáciles de mantener. Disfruto navegando entre el Frontend, donde priorizo la experiencia de usuario y la estética, y el Backend, donde aseguro la lógica de negocio y la eficiencia de las bases de datos.
          </p>
          <p>
            En el Frontend, me desempeño con <span className="font-semibold text-indigo-500">React y Angular</span>, utilizando herramientas modernas como Bootstrap y Tailwind para el diseño rápido y responsivo. En el Backend, mi herramienta preferida es <span className="font-semibold text-indigo-500">Node.js (Express o NestJS)</span>, complementado con bases de datos SQL (PostgreSQL) y NoSQL (MongoDB).
          </p>
          <p>
            Siempre estoy buscando aprender y aplicar las últimas tendencias tecnológicas para entregar soluciones que realmente resuelvan problemas. ¡Echa un vistazo a mis proyectos a continuación!
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
