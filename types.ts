interface PageData {
  access_token: string;
  category: string;
  category_list: { id: string; name: string }[];
  name: string;
  id: string;
  tasks: string[];
}

interface PagesData {
  data: Array<PageData>;
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

interface ConvertedPage {
  value: string;
  label: string;
}

interface MetricData {
  name: string;
  period: string;
  values: Array<{
    value: number | object; // Adjusted to handle nested objects if needed
    end_time: string;
  }>;
  title: string;
  description: string;
  id: string;
}

interface ApiResponse {
  data: MetricData[];
  paging: {
    previous?: string;
    next?: string;
  };
}
interface SummaryDataRow {
  ID: string;
  Name: string;
  StartDate: string; // New property to store the earliest start date
  EndDate: string; // New property to store the latest end date
  Total: number;
}

interface DetailedDataRow {
  ID: string;
  Name: string;
  Period: string;
  Description: string;
  Title: string;
  Values: string;
}

type WorksheetDataType = SummaryDataRow | DetailedDataRow;

interface ExportOptions {
  summaryData: WorksheetDataType[];
  detailedData: WorksheetDataType[];
  fileName: string;
}
