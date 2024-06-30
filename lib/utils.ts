import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(timestamp: string | Date, time = true) {
  if (!timestamp) return "";
  const newTimestamp =
    typeof timestamp === "string" ? timestamp : timestamp?.toISOString();
  return time
    ? newTimestamp.replace("T", " ").replace(".000Z", "")
    : newTimestamp.split("T").at(0);
}

// Assuming this function is part of your component or a helper function
export function prepareChartData(
  metricName: string,
  data?: MetricData[]
): any[] {
  // Filter data based on the metric name
  const filteredData = data?.filter((item) => item.name === metricName);

  // Initialize an empty array to hold our data points
  const dataPoints: Array<{ x: string | number; y: number }> = [];

  // Iterate over each item in the filtered data
  filteredData?.forEach((item) => {
    // Check if the values array exists and has at least one element
    if (item.values && item.values.length > 0) {
      // Map through the values array
      item.values.forEach((valueObj) => {
        // Assuming 'value' is the field you want to plot
        // If 'value' is a number, add it to the dataPoints array
        if (typeof valueObj.value === "number") {
          // Directly use the end_time as the x-value
          const xValue = valueObj.end_time; // Assuming end_time is already in the correct format
          dataPoints.push({ x: xValue, y: valueObj.value });
        }
        // Handle other cases (e.g., nested objects) as needed
      });
    }
  });

  // Return a single dataset object with the collected data points
  return [
    {
      name: metricName, // Using metricName as the dataset name
      data: dataPoints,
      color: "#33C2FF", // Optional: Set a color for the dataset
    },
  ];
}
