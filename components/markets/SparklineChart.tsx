'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineChartProps {
  data: { value: number }[];
  isPositive: boolean;
}

export default function SparklineChart({ data, isPositive }: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={isPositive ? '#10b981' : '#ef4444'} 
          strokeWidth={1.5} 
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
