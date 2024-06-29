"use client";
import PagesList from "@/components/pages-list";
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
import { PiExportDuotone } from "react-icons/pi";

const dummyData: ApiResponse = {
  data: [
    {
      name: "page_follows",
      period: "day",
      values: [
        {
          value: 0,
          end_time: "2024-06-27T07:00:00+0000",
        },
        {
          value: 0,
          end_time: "2024-06-28T07:00:00+0000",
        },
      ],
      title: "Lifetime Total Follows",
      description:
        "Lifetime: The number of followers of your Facebook Page or profile. This is calculated as the number of follows minus the number of unfollows over the lifetime of your Facebook Page or profile. ",
      id: "298712583335639/insights/page_follows/day",
    },
    {
      name: "page_post_engagements",
      period: "day",
      values: [
        {
          value: 0,
          end_time: "2024-06-27T07:00:00+0000",
        },
        {
          value: 0,
          end_time: "2024-06-28T07:00:00+0000",
        },
      ],
      title: "Daily Post Engagements",
      description:
        "Daily: The number of times people have engaged with your posts through like, comments and shares and more.",
      id: "298712583335639/insights/page_post_engagements/day",
    },
    {
      name: "page_impressions",
      period: "day",
      values: [
        {
          value: 0,
          end_time: "2024-06-27T07:00:00+0000",
        },
        {
          value: 0,
          end_time: "2024-06-28T07:00:00+0000",
        },
      ],
      title: "Daily Total Impressions",
      description:
        "Daily: The number of times any content from your Page or about your Page entered a person's screen. This includes posts, stories, ads, as well other content or information on your Page. (Total Count)",
      id: "298712583335639/insights/page_impressions/day",
    },
    {
      name: "page_actions_post_reactions_total",
      period: "day",
      values: [
        {
          value: {},
          end_time: "2024-06-27T07:00:00+0000",
        },
        {
          value: {},
          end_time: "2024-06-28T07:00:00+0000",
        },
      ],
      title: "Daily: total post reactions of a page.",
      description: "Daily: total post reactions of a page.",
      id: "298712583335639/insights/page_actions_post_reactions_total/day",
    },
  ],
  paging: {
    previous:
      "https://graph.facebook.com/v20.0/298712583335639/insights?access_token=EABuacXANtYUBOz27BJYmuacZAjViDtOb1iZC1mIplIOjXyUsOb9RJRjfSyek0Yf5Ax66U7HtZATiZBfDMzLBwTk4hmSqttBin91H0RjM663cZBhrrStZBjcwiQOqqncCdmGTJSEcoTHKJoW1OPVvzfueukMEresyM2VHYcOog1SbjYPGNwLKVGitSXbJ6yiG2g8BNiGw6GeZCcr8IsCZA8pa0hrNhnRZAtzCz&pretty=0&metric=page_follows%2Cpage_post_engagements%2Cpage_impressions%2Cpage_actions_post_reactions_total&period=day&since=1719212400&until=1719385200",
    next: "https://graph.facebook.com/v20.0/298712583335639/insights?access_token=EABuacXANtYUBOz27BJYmuacZAjViDtOb1iZC1mIplIOjXyUsOb9RJRjfSyek0Yf5Ax66U7HtZATiZBfDMzLBwTk4hmSqttBin91H0RjM663cZBhrrStZBjcwiQOqqncCdmGTJSEcoTHKJoW1OPVvzfueukMEresyM2VHYcOog1SbjYPGNwLKVGitSXbJ6yiG2g8BNiGw6GeZCcr8IsCZA8pa0hrNhnRZAtzCz&pretty=0&metric=page_follows%2Cpage_post_engagements%2Cpage_impressions%2Cpage_actions_post_reactions_total&period=day&since=1719558000&until=1719730800",
  },
};
export default function Home() {
  // Calculate totals for each metric
  const metricsWithTotals = dummyData.data.map((metric) => ({
    ...metric,
    totalValue: metric.values.reduce(
      (acc, curr) => acc + (typeof curr.value === "number" ? curr.value : 0),
      0
    ),
  }));

  // Prepare summary data
  // Prepare summary data with each metric's total in its own row
  const summaryData: SummaryDataRow[] = dummyData.data.reduce(
    (acc: SummaryDataRow[], metric: MetricData) => {
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
    },
    []
  );

  // Prepare detailed data
  const detailedData: DetailedDataRow[] = dummyData.data.map((metric) => ({
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
  }));

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
            <PagesList />
          </div>
        </div>
        <Card
          className="sm:col-span-2 flex justify-between gap-4"
          x-chunk="dashboard-05-chunk-0"
        >
          <CardHeader className="pb-3">
            <CardTitle>Hi Mohith!</CardTitle>

            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Select a page to view metrics and insights. Use the date fileter
              to get the filtered data
            </CardDescription>
          </CardHeader>
          <div className="p-6">
            <Avatar className="size-20">
              <AvatarImage src="https://github.com/shadcn.png" alt="userName" />
              <AvatarFallback>FB</AvatarFallback>
            </Avatar>
          </div>
        </Card>

        {metricsWithTotals.map((metric) => {
          const title = metricTitles[metric.name];
          if (!title) return null; // Skip if no matching title found

          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-4xl">{metric.totalValue}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {/* Placeholder for percentage change, adjust as needed */}
                  +25% from last week
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
