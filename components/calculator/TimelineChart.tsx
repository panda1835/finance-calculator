'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialInputs, generateTimelineData, CalculationResults } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TimelineChartProps {
  inputs: FinancialInputs;
  mode: 'goal-based' | 'time-based';
  results?: CalculationResults;
}

export function TimelineChart({ inputs, mode, results }: TimelineChartProps) {
  const data = generateTimelineData(inputs, mode, results);
  
  let targetValue = inputs.targetFINumber;
  if (mode === 'time-based') {
    targetValue = results?.calculatedFINumber 
      ? results.calculatedFINumber 
      : inputs.monthlyExpenses * 12 * 25;
  }

  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biểu Đồ Tăng Trưởng Tài Sản</CardTitle>
        <CardDescription>
          Dự báo tài sản của bạn qua các năm
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onMouseMove={(state: any) => {
                if (state.activePayload && state.activePayload[0]) {
                  setHoveredValue(state.activePayload[0].value);
                }
              }}
              onMouseLeave={() => setHoveredValue(null)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="year" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Năm ${value}`}
              />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(value)
                }
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Năm ${label}`}
                cursor={{ fill: 'transparent' }} // Hide the default bar highlight if desired, or keep it
              />
              <Legend />
              <Bar 
                dataKey="savings" 
                name="Tổng Tài Sản" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <ReferenceLine
                y={targetValue}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                label={{
                  value: 'Mục Tiêu',
                  position: 'right',
                  fill: 'hsl(var(--destructive))',
                  fontSize: 12
                }}
              />
              {hoveredValue !== null && (
                <ReferenceLine
                  y={hoveredValue}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                  label={{
                    value: formatCurrency(hoveredValue),
                    position: 'left',
                    fill: 'hsl(var(--foreground))',
                    fontSize: 12,
                    fontWeight: 'bold',
                    className: 'bg-background px-1'
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
