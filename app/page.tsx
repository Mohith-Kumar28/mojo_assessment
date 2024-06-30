"use client";
import PagesList from "@/components/pages-list";
import { PathFinderLoader } from "@/components/path-finder-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { exportToExcel } from "@/utils/export-to-xcell";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { PiExportDuotone } from "react-icons/pi";

export default function Home() {
  const [selectedPage, setSelectedPage] = useState<PageData>();

  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<ApiResponse>();
  const { data: session }: any = useSession();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v20.0/${selectedPage?.id}/insights?pretty=0&metric=page_follows,page_post_engagements,page_impressions,page_actions_post_reactions_total&period=day&access_token=${selectedPage?.access_token}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const metricsDataRes: ApiResponse = await response.json();
        console.log("pagesData", metricsDataRes);
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
  }, [selectedPage]);

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
    page_follows: "Total Followers / Fans",
    page_post_engagements: "Total Engagement",
    page_impressions: "Total Impressions",
    page_actions_post_reactions_total: "Total Reactions",
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="grid gap-4 lg:grid-cols-2 ">
        {session && (
          <div className="grid gap-4   sm:grid-cols-5 sm:col-span-2">
            <Button onClick={handleExportClick} className="sm:col-span-1">
              <PiExportDuotone className="text-2xl" />
            </Button>
            <div className="sm:col-span-2">
              <DateRangePicker
                onUpdate={(values) => console.log(values)}
                initialDateFrom="2023-01-01"
                initialDateTo="2023-12-31"
                align="start"
                locale="en-GB"
                showCompare={false}
              />
            </div>
            <div className="sm:col-span-2">
              <PagesList
                setSelectedPage={setSelectedPage}
                selectedPage={selectedPage}
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
                ? "Give account access by pressing the connect with facebook button, to view pages metrics"
                : "Select a page to view metrics and insights. Use the date fileter to get the filtered data"}
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
        {session ? (
          metricsWithTotals?.map((metric) => {
            const title = metricTitles[metric.name];
            if (!title) return null; // Skip if no matching title found

            return (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardDescription>{title}</CardDescription>
                  <CardTitle className="text-4xl">
                    {metric.totalValue}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {/* Placeholder for percentage change, adjust as needed */}
                    +25% from last week
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex justify-center w-full sm:col-span-2">
            <PathFinderLoader />
          </div>
        )}
      </div>
    </main>
  );
}
