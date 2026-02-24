import React from 'react';
import AboutPresentational from './AboutPresentational';

const content = [
  'Soy un desarrollador Fullstack con mas de 8 años de experiencia, especializado en el ecosistema JavaScript. Mi enfoque principal es crear aplicaciones robustas, de alto rendimiento y fáciles de mantener. Disfruto navegando entre el Frontend, donde priorizo la experiencia de usuario y la estética, y el Backend, donde aseguro la lógica de negocio y la eficiencia de las bases de datos.',
  'En el Frontend, me desempeño con React y Angular, utilizando herramientas modernas como Bootstrap y Tailwind para el diseño rápido y responsivo. En el Backend, mi herramienta preferida es Node.js (Express o NestJS), complementado con bases de datos SQL (PostgreSQL) y NoSQL (MongoDB).',
  'Siempre estoy buscando aprender y aplicar las últimas tendencias tecnológicas para entregar soluciones que realmente resuelvan problemas. ¡Echa un vistazo a mis proyectos a continuación!'
];

export default function About() {
  return <AboutPresentational content={content} />;
}
