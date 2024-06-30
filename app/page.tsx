"use client";
import PagesList from "@/components/pages-list";

import { ShuffleLoader } from "@/components/shuffle-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { exportToExcel } from "@/utils/export-to-xcell";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { PiExportDuotone } from "react-icons/pi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricGraph from "@/components/metric-graph";
import { prepareChartData } from "@/lib/utils";

export default function Home() {
  const { data: session }: any = useSession();
  const [selectedPage, setSelectedPage] = useState<PageData>();

  const [period, setPeriod] = useState("day");

  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<ApiResponse>();

  // State variable for the selected date range

  const [selectedRange, setSelectedRange] =
    useState<DateRangePickerValue | null>({
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date(),
    });

  // Function  to convert date to Unix timestamp
  const dateToUnixTimestamp = (date: Date): number => {
    return Math.floor(date.getTime() / 1000); // Convert milliseconds to seconds
  };

  // Handler for date range picker update
  // Adjust the type of the parameter to match what the DateRangePicker expects
  const handleDateRangeUpdate: DateRangePickerOnChangeHandler = (dateRange) => {
    setSelectedRange(dateRange);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v20.0/${
            selectedPage?.id
          }/insights?pretty=0&metric=page_daily_follows_unique,page_impressions,page_post_engagements,page_actions_post_reactions_like_total&period=day&access_token=${
            selectedPage?.access_token
          }&${period && "period=" + period}&${
            selectedRange?.from &&
            "since=" + dateToUnixTimestamp(selectedRange.from)
          }&${
            selectedRange?.to &&
            "until=" + dateToUnixTimestamp(selectedRange.to)
          }`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const metricsDataRes: ApiResponse = await response.json();
        // console.log("pagesData", metricsDataRes);
        // const convertedData = convertPagesData(pagesDataRes);
        setMetricsData(metricsDataRes);
        // localStorage.setItem("pagesData", JSON.stringify(convertedData)); // Save data to local storage
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (selectedPage?.access_token) {
      fetchData();
    }
  }, [selectedPage, period, selectedRange]);

  // Calculate totals for each metric
  const metricsWithTotals = metricsData?.data.map((metric) => ({
    ...metric,
    totalValue: metric.values.reduce(
      (acc, curr) => acc + (typeof curr.value === "number" ? curr.value : 0),
      0
    ),
  }));

  // Prepare summary data
  // Prepare summary data with each metric's total in its own row
  const summaryData: SummaryDataRow[] =
    metricsData?.data.reduce((acc: SummaryDataRow[], metric: MetricData) => {
      // Calculate the earliest start date and latest end date for the metric
      const startDate = metric.values.reduce(
        (
          minStartDate: string,
          value: { value: number | object; end_time: string }
        ) => {
          return minStartDate < value.end_time ? minStartDate : value.end_time;
        },
        metric.values[0].end_time
      );

      const endDate = metric.values.reduce(
        (
          maxEndDate: string,
          value: { value: number | object; end_time: string }
        ) => {
          return maxEndDate > value.end_time ? maxEndDate : value.end_time;
        },
        metric.values[0].end_time
      );

      // Check if the metric has already been added to the summary data
      const existingMetricIndex = acc.findIndex(
        (item) => item.Name === metric.name
      );

      if (existingMetricIndex !== -1) {
        // Update the total value for the existing metric
        acc[existingMetricIndex].Total += metric.values.reduce(
          (total: number, value: { value: number | object }) => {
            return typeof value.value === "number"
              ? total + value.value
              : total;
          },
          0
        );
      } else {
        // Add a new entry for the metric
        acc.push({
          ID: metric.id,
          Name: metric.name,
          StartDate: startDate,
          EndDate: endDate,
          Total: metric.values.reduce(
            (total: number, value: { value: number | object }) => {
              return typeof value.value === "number"
                ? total + value.value
                : total;
            },
            0
          ),
        });
      }
      return acc;
    }, []) || [];

  // Prepare detailed data
  const detailedData: DetailedDataRow[] =
    metricsData?.data.map((metric) => ({
      ID: metric.id,
      Name: metric.name,
      Period: metric.period,
      Description: metric.description,
      Title: metric.title,
      Values: metric.values
        .map((value) => {
          let valueStr = "";
          if (typeof value.value === "number") {
            valueStr = `${value.value}`;
          } else if (typeof value.value === "object" && value.value !== null) {
            // Attempt to stringify the object value
            valueStr = JSON.stringify(value.value);
          }
          return `${valueStr} at ${value.end_time}`;
        })
        .join(", "), // Join all values with a comma
    })) || [];

  // Function to handle export click
  const handleExportClick = () => {
    exportToExcel({
      summaryData,
      detailedData,
      fileName: "metrics.xlsx",
    });
  };

  // Map of metric names to card titles
  const metricTitles: { [key: string]: string } = {
    page_daily_follows_unique: "Total Followers / Fans",
    page_post_engagements: "Total Engagement",
    page_impressions: "Total Impressions",
    page_actions_post_reactions_like_total: "Total Like Reactions",
  };

  return (
    <main className="flex  flex-col items-center justify-between px-14">
      <div className="grid gap-4 lg:grid-cols-2 ">
        {session && (
          <div className="grid gap-4   sm:grid-cols-8 sm:col-span-2">
            <Button onClick={handleExportClick} className="sm:col-span-1">
              <PiExportDuotone className="text-2xl" />
            </Button>
            <div className="sm:col-span-2">
              <PagesList
                setSelectedPage={setSelectedPage}
                selectedPage={selectedPage}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {/* <SelectLabel>Period</SelectLabel> */}
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="days_28">28 Days</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <DateRangePicker
                onUpdate={(values) => handleDateRangeUpdate(values.range)}
                // onUpdate={(value) => console.log("a", value)}
                initialDateFrom={selectedRange?.from}
                initialDateTo={selectedRange?.to}
                align="start"
                // locale="en-GB"
                showCompare={false}
              />
            </div>
          </div>
        )}
        <Card
          className="sm:col-span-2 flex flex-wrap justify-between md:gap-4"
          x-chunk="dashboard-05-chunk-0"
        >
          <CardHeader className="pb-3">
            <CardTitle>Hi {session?.user?.name}!</CardTitle>

            <CardDescription className="max-w-lg text-balance leading-relaxed">
              {!session
                ? "Please grant account access by clicking the 'Login with Facebook' button to view page metrics."
                : "Choose a page to explore metrics and insights. Utilize the period and date filter to refine your data view."}
            </CardDescription>
          </CardHeader>
          <div className="p-6 flex flex-col  align-middle justify-center">
            {!session ? (
              <>
                <Button
                  onClick={() => {
                    signIn("facebook");
                  }}
                  className="gap-3"
                >
                  <FaFacebook className="text-lg" />
                  <span className="text-sm font-semibold leading-6">
                    Login with Facebook
                  </span>
                </Button>
              </>
            ) : (
              <>
                <Avatar className="size-20">
                  <AvatarImage src={session?.user?.image ?? ""} alt="user" />
                  <AvatarFallback>FB</AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </Card>
        {metricsWithTotals && metricsWithTotals.length > 0 ? (
          metricsWithTotals?.map((metric) => {
            const title = metricTitles[metric.name];
            if (!title) return null; // Skip if no matching title found

            return (
              <TooltipProvider key={metric.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="cursor-help">
                      <CardHeader className="pb-2">
                        <CardDescription>{title}</CardDescription>
                        <CardTitle className="text-4xl">
                          {metric.totalValue}
                        </CardTitle>
                      </CardHeader>
                      <CardContent></CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    {" "}
                    <div className="text-xs p-3 max-w-lg text-muted-foreground ">
                      {metric.description}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        ) : (
          <div className="flex justify-center w-full sm:col-span-2">
            <ShuffleLoader />
          </div>
        )}

        <Tabs
          defaultValue="page_daily_follows_unique"
          className="sm:col-span-2"
        >
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(metricTitles).map((key) => (
              <TabsTrigger key={key} value={key}>
                {metricTitles[key]}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(metricTitles).map((key) => (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader>
                  {/* <CardDescription>{metricTitles[key]}</CardDescription> */}
                </CardHeader>
                <CardContent className="space-y-2">
                  <MetricGraph
                    // title={metricTitles[key]}
                    chartData={prepareChartData(key, metricsData?.data)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
