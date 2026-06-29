"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type LineChartSeries = {
  name: string;
  data: number[];
};

type LineChartOneProps = {
  categories?: string[];
  series?: LineChartSeries[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  tooltipFormatter?: (value: number) => string;
  chartId?: string;
  minWidth?: string;
};

const DEFAULT_CATEGORIES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DEFAULT_SERIES: LineChartSeries[] = [
  {
    name: "Sales",
    data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
  },
  {
    name: "Revenue",
    data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  },
];

export default function LineChartOne({
  categories = DEFAULT_CATEGORIES,
  series = DEFAULT_SERIES,
  colors = ["#465FFF", "#9CB9FF"],
  height = 310,
  showLegend = false,
  tooltipFormatter,
  chartId = "chartEight",
  minWidth = "1000px",
}: LineChartOneProps) {
  const options: ApexOptions = {
    legend: {
      show: showLegend,
      position: "top",
      horizontalAlign: "left",
    },
    colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      height,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: series.map(() => 2),
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: tooltipFormatter ?? ((val: number) => `${val}`),
      },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id={chartId} style={{ minWidth }}>
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={height}
        />
      </div>
    </div>
  );
}
