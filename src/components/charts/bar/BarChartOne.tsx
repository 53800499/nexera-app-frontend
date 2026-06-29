"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type BarChartSeries = {
  name: string;
  data: number[];
};

type BarChartOneProps = {
  categories?: string[];
  series?: BarChartSeries[];
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

const DEFAULT_SERIES: BarChartSeries[] = [
  {
    name: "Sales",
    data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
  },
];

export default function BarChartOne({
  categories = DEFAULT_CATEGORIES,
  series = DEFAULT_SERIES,
  colors = ["#1b3a6b"],
  height = 180,
  showLegend = true,
  tooltipFormatter,
  chartId = "chartOne",
  minWidth = "1000px",
}: BarChartOneProps) {
  const options: ApexOptions = {
    colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: showLegend,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: tooltipFormatter ?? ((val: number) => `${val}`),
      },
    },
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id={chartId} style={{ minWidth }}>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={height}
        />
      </div>
    </div>
  );
}
