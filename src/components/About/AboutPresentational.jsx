import React from 'react';

export default function AboutPresentational({ content }) {
  return (
    <section id="acerca" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Acerca de Mí</h2>
        <div className="text-lg leading-relaxed text-gray-600 space-y-4">
          {content.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}
