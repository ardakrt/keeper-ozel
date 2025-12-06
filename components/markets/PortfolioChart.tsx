'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip, YAxis } from 'recharts';

interface PortfolioChartProps {
  assets: any[]; // Using any for simplicity but ideally should be Asset type
}

// Toplam portföy değeri için grafik verisi - varlıklara göre dinamik
const generateChartData = (assets: any[]) => {
  const totalValue = assets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);
  if (totalValue === 0) {
    return Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: 0 }));
  }
  
  return Array.from({ length: 30 }, (_, i) => {
    const startMultiplier = 0.85 + Math.random() * 0.1;
    const dailyChange = (i / 30) * (1 - startMultiplier) + (Math.random() - 0.5) * 0.03;
    const dayValue = totalValue * (startMultiplier + dailyChange + (i * 0.005));
    return { day: i + 1, value: Math.max(0, dayValue) };
  });
};

export default function PortfolioChart({ assets }: PortfolioChartProps) {
  const portfolioChartData = useMemo(() => {
    return generateChartData(assets);
  }, [assets]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={portfolioChartData}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '8px 12px'
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => [`₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 'Değer']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#10b981" 
          strokeWidth={2.5} 
          dot={false}
          fill="url(#colorValue)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
