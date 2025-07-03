'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface RevenueLineChartProps {
  userId: string;
  pipelineId: string;
}

type DataPoint = { month: string; value: number };

export default function RevenueLineChart({ userId, pipelineId }: RevenueLineChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    console.log('Carregando dados para:', { userId, pipelineId });

    // Exemplo simples para simular dados filtrados
    if (pipelineId === 'Program WRA') {
      setData([
        { month: 'Jan', value: 400 },
        { month: 'Feb', value: 300 },
        { month: 'Mar', value: 500 },
        { month: 'Apr', value: 200 },
        { month: 'May', value: 600 },
      ]);
    } else {
      // Outro exemplo para outras pipelines
      setData([
        { month: 'Jan', value: 100 },
        { month: 'Feb', value: 150 },
        { month: 'Mar', value: 80 },
        { month: 'Apr', value: 120 },
        { month: 'May', value: 200 },
      ]);
    }
  }, [userId, pipelineId]);

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
        Faturamento Mensal
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#4dc4ff" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
