'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface LeadsBarChartProps {
  data: ChartData[];
}

const LeadsBarChart: React.FC<LeadsBarChartProps> = ({ data }) => {
  // Calcula o total dos valores
  const totalCards = data.reduce((acc, item) => acc + item.value, 0);

  // Adiciona o total como uma barra extra
  const dataWithTotal = [...data, { name: 'Total', value: totalCards }];

  // Ordena do maior para menor valor (incluindo o total)
  const sortedData = [...dataWithTotal].sort((a, b) => b.value - a.value);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        height: '18rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#1f2937',
        }}
      >
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#263c58" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadsBarChart;
