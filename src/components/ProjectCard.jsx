import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = React.memo(({ title, description, tags, demoUrl, isInternal = false }) => {
  const renderTag = useCallback((tag) => (
    <span
      key={tag}
      className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full"
    >
      {tag}
    </span>
  ), []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform">
      <h3 className="text-2xl font-semibold mb-3 text-indigo-500">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2 text-sm font-medium mb-4">
        {tags.map(renderTag)}
      </div>
      <div className="flex space-x-4">
        {demoUrl ? (
          isInternal ? (
            <Link 
              to={demoUrl} 
              className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-300 flex items-center gap-1"
            >
              <span role="img" aria-label="mano señalando a la derecha">👉</span> ver Demo
            </Link>
          ) : (
            <a 
              href={demoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span role="img" aria-label="mano señalando a la derecha">👉</span> ver Demo
            </a>
          )
        ) : (
          <span className="text-gray-400 font-medium">Demo próximamente</span>
        )}
        {/* <a href="#" className="text-gray-600 hover:text-gray-800">
          GitHub &rarr;
        </a> */}
      </div>
    </div>
  );
});

export default ProjectCard;
