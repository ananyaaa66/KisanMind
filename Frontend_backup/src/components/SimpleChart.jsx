import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SimpleChart({
  data,
  dataKey = 'price',
  xKey = 'day',
  stroke = '#A8FF60',
  height = 200,
  showGrid = true,
  showAxes = true,
}) {
  if (!data || data.length === 0) return <div className="h-auto bg-gray-900 rounded-lg p-4">No data</div>

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />}
        {showAxes && (
          <>
            <XAxis
              dataKey={xKey}
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          dot={false}
          strokeWidth={2}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
