'use client';

import React from 'react';
import Image from 'next/image';
import Logo from '../imagens/logoWRA-branca.png';
import FilterBar from './FilterBar';

type TopBarProps = {
  onClear: () => void;
  onFilterChange: (userId: string, pipelineId: string) => void;
};

export default function TopBar({ onClear, onFilterChange }: TopBarProps) {
  return (
    <header
      style={{
        width: '100%',
        backgroundColor: '#072143',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Image src={Logo} alt="Logo" height={90} style={{ width: 'auto', cursor: 'pointer' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', userSelect: 'none' }}></h1>
      </div>

      <FilterBar onFilterChange={onFilterChange} onClear={onClear} />
    </header>
  );
}
