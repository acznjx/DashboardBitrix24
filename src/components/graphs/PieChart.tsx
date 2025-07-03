'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from 'recharts';

// Cores usadas para os usuários no gráfico
const COLORS = [
  '#0D3B66', '#144E86', '#1C6BA0', '#2980B9',
  '#4A90E2', '#7BAEDC', '#A3BDD9', '#C5D7EB',
];

// Tipagens esperadas
interface Deal {
  ID: string;
  CATEGORY_ID: string;
  UF_CRM_START_TMA?: string;
  ASSIGNED_BY_ID?: string;
  STAGE_ID?: string;
  OPPORTUNITY?: string;
  UF_CRM_INVESTMENT?: string;
}

interface UserWithFullName {
  ID: string;
  fullName: string;
}

interface Props {
  userId: string;
  pipelineId: string;
  users: UserWithFullName[];
  deals: Deal[];
  loading: boolean;
}

// Forma animada usada ao passar o mouse em um setor do gráfico
const renderActiveShape = (props: unknown) => {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = '#000',
    percent = 0,
    value = 0,
  } = props as {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
    percent?: number;
    value?: number;
  };

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path d={`M${cx},${cy}L${sx},${sy}`} stroke={fill} fill="none" />
      <circle cx={sx} cy={sy} r={4} fill={fill} />
      <text
        x={sx + (cos >= 0 ? 8 : -8)}
        y={sy}
        textAnchor={cos >= 0 ? 'start' : 'end'}
        fill="#333"
        fontSize={14}
        fontWeight="bold"
      >
        {`${value} card(s)`}
      </text>
      <text
        x={sx + (cos >= 0 ? 8 : -8)}
        y={sy + 18}
        textAnchor={cos >= 0 ? 'start' : 'end'}
        fill="#666"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export default function StatusPieChart({ userId, users, deals, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Nome do usuário atualmente ativo (selecionado no gráfico ou legenda)
  const [activeName, setActiveName] = useState<string | null>(null);

  // Dados para TODOS os usuários com cards
  const allChartData = useMemo(() => {
    const counts: Record<string, { fullName: string; count: number }> = {};
    users.forEach(user => {
      counts[user.ID] = { fullName: user.fullName, count: 0 };
    });

    deals.forEach(deal => {
      if (!userId || deal.ASSIGNED_BY_ID === userId) {
        const assignedId = deal.ASSIGNED_BY_ID;
        if (assignedId && counts[assignedId]) {
          counts[assignedId].count++;
        }
      }
    });

    return Object.values(counts)
      .filter(entry => entry.count > 0)
      .map(entry => ({
        name: entry.fullName,
        value: entry.count,
      }));
  }, [users, deals, userId]);

  // Apenas os 7 usuários com mais cards para exibir na legenda
  const top7LegendData = useMemo(() => {
    return [...allChartData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [allChartData]);

  // Fecha o destaque do gráfico ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveName(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        height: '18rem',
        userSelect: 'none',
      }}
    >
      {/* LEGENDA */}
      <div
        style={{
          width: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.5rem',
          paddingRight: '1rem',
          fontSize: '0.9rem',
          color: '#333',
        }}
      >
        {top7LegendData.length === 0 ? (
          <div style={{ color: '#718096', textAlign: 'center' }}>No data</div>
        ) : (
          top7LegendData.map((entry, index) => {
            const total = allChartData.reduce((acc, cur) => acc + cur.value, 0);
            const percent = ((entry.value / total) * 100).toFixed(1);
            const isActive = activeName === entry.name;

            return (
              <div
                key={`legend-${entry.name}`}
                onClick={() => setActiveName(isActive ? null : entry.name)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? COLORS[index % COLORS.length] : '#333',
                }}
                title={`Click to highlight ${entry.name}`}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: COLORS[index % COLORS.length],
                    display: 'inline-block',
                  }}
                />
                <span style={{ flexGrow: 1 }}>{entry.name}</span>
                <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
                  {percent}%
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* GRÁFICO DE PIZZA */}
      <div style={{ flexGrow: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>
        ) : allChartData.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#718096' }}>
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={3}
                activeIndex={
                  activeName
                    ? allChartData.findIndex(e => e.name === activeName)
                    : undefined
                }
                activeShape={renderActiveShape}
                onClick={(_, index) => {
                  const name = allChartData[index]?.name;
                  setActiveName(name === activeName ? null : name);
                }}
              >
                {allChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    cursor="pointer"
                    stroke={allChartData[index].name === activeName ? '#000' : undefined}
                    strokeWidth={allChartData[index].name === activeName ? 3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string | undefined) => [
                  `${value} card(s)`,
                  name ?? '',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
