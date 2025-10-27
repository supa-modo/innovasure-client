import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: Array<{
    name: string;
    count?: number;
    value?: number;
    [key: string]: any;
  }>;
  dataKey: string;
  color?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKey,
  color = "#3B82F6",
  xAxisLabel,
  yAxisLabel,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient
            id={`gradient-${dataKey}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#6B7280" }}
          stroke="#E5E7EB"
          label={
            xAxisLabel
              ? {
                  value: xAxisLabel,
                  position: "insideBottom",
                  offset: -10,
                  style: { textAnchor: "middle", fill: "#6B7280" },
                }
              : undefined
          }
        />
        <YAxis
          tick={{ fill: "#6B7280" }}
          stroke="#E5E7EB"
          label={
            yAxisLabel
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#6B7280" },
                }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: any) => Number(value).toLocaleString("en-KE")}
        />
        <Bar
          dataKey={dataKey}
          fill={`url(#gradient-${dataKey})`}
          radius={[8, 8, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
