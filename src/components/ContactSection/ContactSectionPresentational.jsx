import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

export default function ContactSectionPresentational({ formData, handleChange, handleSubmit }) {
  return (
    <section id="contacto" className="py-20 bg-gray-900 text-white" aria-labelledby="contacto-heading" role="region">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="contacto-heading" className="text-4xl font-bold text-center mb-12">¿Listo para colaborar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 text-indigo-500">Envíame un mensaje</h3>
            <form onSubmit={handleSubmit} aria-label="Formulario de contacto">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Mensaje <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  rows={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Enviar
              </button>
            </form>
          </div>
          <div className="flex flex-col justify-center items-center space-y-6">
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-indigo-400 text-2xl" />
              <span className="text-gray-300">correo@ejemplo.com</span>
            </div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faPhone} className="text-indigo-400 text-2xl" />
              <span className="text-gray-300">+57 123 456 7890</span>
            </div>
            <div className="flex space-x-6 mt-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin} className="text-indigo-400 text-2xl" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FontAwesomeIcon icon={faGithub} className="text-indigo-400 text-2xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} className="text-indigo-400 text-2xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
