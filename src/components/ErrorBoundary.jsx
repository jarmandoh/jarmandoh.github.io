import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes loguear el error a un servicio externo aquí
    console.error('ErrorBoundary atrapó un error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 text-red-600">
          <h1 className="text-3xl font-bold mb-4">¡Algo salió mal!</h1>
          <p>Por favor, recarga la página o contacta al soporte.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
