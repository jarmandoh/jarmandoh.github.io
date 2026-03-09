import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

import React, { useEffect } from 'react';
import ContactSection from '../components/ContactSection';

function Contact() {
  useEffect(() => {
    document.title = 'Contacto | Mi Portafolio';
  }, []);
  const isDark = useDarkMode();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={`min-h-screen pt-20 pb-10 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Contacto</h1>
          <p className={`mt-4 text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            ¿Tienes un proyecto en mente? ¡Hablemos!
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className={`rounded-xl shadow-lg p-8 transition-colors ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:outline-none focus:ring-2`}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:outline-none focus:ring-2`}
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mensaje
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  } border focus:outline-none focus:ring-2`}
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg shadow-md text-center transition-colors ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Email</h3>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>contacto@ejemplo.com</p>
            </div>
            <div className={`p-6 rounded-lg shadow-md text-center transition-colors ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Ubicación</h3>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ciudad, País</p>
            </div>
            <div className={`p-6 rounded-lg shadow-md text-center transition-colors ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Redes Sociales</h3>
              <div className="mt-2 flex justify-center space-x-4">
                <a href="https://linkedin.com/in/jarmandoh" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}>
                  LinkedIn
                </a>
                <a href="https://github.com/jarmandoh" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}>
                  GitHub
                </a>
                <a href="https://twitter.com/jarmandoh" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
                }`}>
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;