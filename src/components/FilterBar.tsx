'use client';

import React from 'react';
import { useBitrixData } from '../hooks/useBitrixData';
import type { UserWithFullName } from '../types/bitrix';

type FilterBarProps = {
  onFilterChange: (userId: string, pipelineId: string) => void;
  onClear?: () => void;
};

export default function FilterBar({ onFilterChange, onClear }: FilterBarProps) {
  const { pipelines, pipelineUsersMap, loading } = useBitrixData();

  const defaultPipelineId =
    pipelines.find(p => p.name === 'WRA | Program WRA')?.id || (pipelines[0]?.id ?? '9');

  const [pipelineId, setPipelineId] = React.useState<string>(defaultPipelineId);
  const [userId, setUserId] = React.useState<string>('');

  const usersForSelectedPipeline: UserWithFullName[] = pipelineUsersMap[pipelineId] || [];

  // Função para montar o nome do usuário com base nos campos disponíveis
  const getUserName = (user: UserWithFullName) => {
    if (user.fullName && user.fullName.trim() !== '') {
      return user.fullName;
    }
    if (user.NAME || user.LAST_NAME) {
      return `${user.NAME ?? ''} ${user.LAST_NAME ?? ''}`.trim();
    }
    if (user.NAME) {
      return user.NAME;
    }
    return 'Unnamed User';
  };

  const handleUserChange = (value: string) => {
    setUserId(value);
    onFilterChange(value, pipelineId);
  };

  const handlePipelineChange = (value: string) => {
    setPipelineId(value);
    onFilterChange(userId, value);
  };

  const handleClear = () => {
    setUserId('');
    setPipelineId(defaultPipelineId);
    if (typeof onClear === 'function') {
      onClear();
    } else {
      onFilterChange('', defaultPipelineId);
    }
  };

  return (
    <>
      <div className="filterBar">
        <select
          className="select"
          value={userId}
          disabled={loading || usersForSelectedPipeline.length === 0}
          onChange={e => handleUserChange(e.currentTarget.value)}
          aria-label="Filter by user"
        >
          <option value="">
            {loading
              ? 'Loading...'
              : usersForSelectedPipeline.length === 0
              ? 'No Users'
              : 'Select User'}
          </option>
          {usersForSelectedPipeline.map(u => (
            <option key={u.ID} value={u.ID}>
              {getUserName(u)}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={pipelineId}
          onChange={e => handlePipelineChange(e.currentTarget.value)}
          aria-label="Filter by pipeline"
        >
          {pipelines.map(p => (
            <option
              key={p.id}
              value={p.id}
              disabled={p.name !== 'WRA | Program WRA'}
            >
              {p.name}
            </option>
          ))}
        </select>

        <button className="btnClear" type="button" onClick={handleClear}>
          Clear
        </button>
      </div>

      <style jsx>{`
        .filterBar {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background-color: #1e2a47;
          border-radius: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .select {
          min-width: 180px;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #d4af37;
          background-color: #fff;
          color: #072143;
          cursor: pointer;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
          appearance: none;
          z-index: 1000;
        }

        select option {
          background-color: #fff;
          color: #072143;
        }

        select option:disabled {
          color: #9ca3af;
          background-color: #f0f0f0;
          cursor: not-allowed;
        }

        .select:focus {
          outline: none;
          box-shadow: 0 0 6px 2px #d4af37;
        }

        .btnClear {
          background-color: transparent;
          border: 2px solid #d4af37;
          color: #d4af37;
          font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .btnClear:hover {
          background-color: #d4af37;
          color: #1e2a47;
        }
      `}</style>
    </>
  );
}
