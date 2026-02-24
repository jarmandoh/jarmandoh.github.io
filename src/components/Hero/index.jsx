import React from 'react';
import HeroPresentational from './HeroPresentational';

export default function Hero() {
  const name = 'Janier Hernandez';
  const description = 'Desarrollador Fullstack con pasión por construir experiencias digitales escalables y elegantes.';
  return <HeroPresentational name={name} description={description} />;
}
