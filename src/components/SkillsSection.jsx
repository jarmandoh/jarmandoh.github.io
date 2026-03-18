import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faServer, faCloud } from '@fortawesome/free-solid-svg-icons';
import { useScrollAnimation, randomDirection } from '../hooks/useScrollAnimation';

const Skills = () => {
  const [titleRef, titleVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation();
  const titleDir = useRef(randomDirection()).current;
  const cardDirs = useRef([randomDirection(), randomDirection(), randomDirection()]).current;

  const skillsData = [
    {
      title: 'Frontend',
      icon: 'screen',
      skills: [
        'React / Next.js',
        'JavaScript (ES6+), TypeScript',
        'HTML5, CSS3, Tailwind CSS',
        'Redux / Zustand',
        'Pruebas (Jest, Cypress)',
      ],
    },
    {
      title: 'Backend',
      icon: 'server',
      skills: [
        'Node.js (Express, NestJS)',
        'Python (Django/Flask)',
        'API RESTful / GraphQL',
        'Autenticación (JWT, OAuth)',
        'Microservicios',
      ],
    },
    {
      title: 'DB & DevOps',
      icon: 'cloud',
      skills: [
        'PostgreSQL, MongoDB, MySQL',
        'Docker / Kubernetes (Básico)',
        'AWS / Google Cloud (GCP)',
        'Git, GitHub Actions',
        'CI/CD',
      ],
    },
  ];

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'screen':
        return <FontAwesomeIcon icon={faDesktop} className="w-6 h-6" />;
      case 'server':
        return <FontAwesomeIcon icon={faServer} className="w-6 h-6" />;
      case 'cloud':
        return <FontAwesomeIcon icon={faCloud} className="w-6 h-6" />;
      default:
        return <FontAwesomeIcon icon={faDesktop} className="w-6 h-6" />;
    }
  };

  return (
    <section id="habilidades" className="py-20 bg-gray-900 text-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          ref={titleRef}
          className={`text-4xl font-bold text-center mb-12 ${titleDir} ${titleVisible ? 'is-visible' : ''}`}
        >
          Mi Stack Tecnológico
        </h2>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {skillsData.map((skillGroup, index) => (
            <div
              key={skillGroup.title}
              className={`bg-gray-800 p-8 rounded-xl shadow-xl transition-[opacity,transform,box-shadow] duration-500 hover:shadow-indigo-900 ${cardDirs[index]} ${gridVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: gridVisible ? `${index * 150}ms` : '0ms' }}
            >
              <h3 className="text-2xl font-semibold mb-4 flex items-center text-indigo-500">
                {renderIcon(skillGroup.icon)}
                <span className="ml-3">{skillGroup.title}</span>
              </h3>
              <ul className="space-y-2 text-gray-300">
                {skillGroup.skills.map((skill, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-indigo-500 mr-2">•</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
