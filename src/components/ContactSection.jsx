import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setFormData({ name: '', email: '', message: '' });
    alert('Mensaje enviado. Me pondré en contacto pronto.');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contacto" className="py-20 bg-gray-900 text-white" aria-labelledby="contacto-heading" role="region">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="contacto-heading" className="text-4xl font-bold text-center mb-12" tabIndex={0}>¿Listo para colaborar?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Formulario de Contacto */}
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
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2"
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
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Mensaje <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-lg shadow-indigo-500/50"
                aria-label="Enviar mensaje de contacto"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>

          {/* Información de Contacto y Redes */}
          <div className="text-center md:text-left pt-8 md:pt-0">
            <h3 className="text-2xl font-semibold mb-6 text-indigo-500">O encuéntrame en:</h3>
            <p className="text-lg text-gray-300 mb-6">
              Siempre estoy abierto a discutir nuevos proyectos, ideas creativas o nuevas oportunidades.
            </p>
            <div className="space-y-4 mb-8">
              <p className="flex items-center justify-center md:justify-start text-gray-300">
                <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 mr-3 text-indigo-500" />
                janier007@gmail.com
              </p>
              <p className="flex items-center justify-center md:justify-start text-gray-300">
                <FontAwesomeIcon icon={faPhone} className="w-6 h-6 mr-3 text-indigo-500" />
                +57 316 325 5774
              </p>
            </div>

            <div className="flex space-x-6 justify-center md:justify-start" role="list" aria-label="Redes sociales">
              {/* LinkedIn */}
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-indigo-500 transition duration-300" aria-label="LinkedIn" role="listitem" tabIndex={0}>
                <FontAwesomeIcon icon={faLinkedin} className="w-8 h-8" />
              </a>
              {/* GitHub */}
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-indigo-500 transition duration-300" aria-label="GitHub" role="listitem" tabIndex={0}>
                <FontAwesomeIcon icon={faGithub} className="w-8 h-8" />
              </a>
              {/* Twitter */}
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-indigo-500 transition duration-300" aria-label="Twitter" role="listitem" tabIndex={0}>
                <FontAwesomeIcon icon={faTwitter} className="w-8 h-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
