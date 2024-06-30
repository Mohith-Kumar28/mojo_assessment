import { formatDateTime } from "@/lib/utils";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type LineGraphProps = {
  chartData: ApexAxisChartSeries;

  dateFormatter?: (val: string) => string;
};

export default function MetricGraph({
  chartData,
  dateFormatter = (val) => formatDateTime(val, false)!,
}: LineGraphProps) {
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      background: "transparent",
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    // colors: [theme.palette.error.main, theme.palette.primary.main],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    theme: {
      // mode: theme.palette.mode,
    },
    stroke: {
      show: true,
      width: 2,
      // colors: [theme.palette.primary.main],
    },
    legend: {
      show: false,
    },
    grid: {
      strokeDashArray: 5,
      // borderColor: theme.palette.divider,
    },
    xaxis: {
      // tickAmount: 1,
      type: "category",
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      labels: {
        formatter: (val) => dateFormatter?.(val) ?? "",
        show: true,
        style: {
          fontSize: "0.65rem",
          // colors: theme.palette.text.secondary,
        },
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      // tickAmount: 10,
      stepSize: 1,
      min: 0,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        formatter: (val) => String(val) ?? "",
        style: {
          // colors: theme.palette.text.secondary,
        },
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      marker: {
        show: true,
      },
      y: {
        formatter: (val) => String(val) ?? "",
      },
      theme: "dark",
    },
  };
  {
    // console.log(chartData);
  }
  return (
    <Chart
      options={chartOptions}
      series={chartData}
      type="line"
      height={260}
      width={"93%"}
    />
  );
}
