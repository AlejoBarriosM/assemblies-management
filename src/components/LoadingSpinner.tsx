// components/LoadingSpinner.tsx
"use client";

import { useLoading } from '@/context/context';
import React from "react"; // Ajusta la ruta si es necesario

const LoadingSpinner: React.FC = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        }}>
            <div style={{
                border: '8px solid #f3f3f3', /* Light grey */
                borderTop: '8px solid #3498db', /* Blue */
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                animation: 'spin 1s linear infinite',
            }}></div>
            {/*
        Para animaciones CSS en Next.js con App Router y componentes "use client",
        puedes usar <style jsx global> o importar un archivo .css.
        Aquí usamos style jsx global para simplicidad.
      */}
            <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default LoadingSpinner;