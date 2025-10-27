import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaChartProps {
  data: Array<{
    date: string;
    revenue?: number;
    count?: number;
    [key: string]: any;
  }>;
  dataKey: string;
  color?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKey,
  color = "#3B82F6",
  xAxisLabel,
  yAxisLabel,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart
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
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
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
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={`url(#gradient-${dataKey})`}
          strokeWidth={2}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
