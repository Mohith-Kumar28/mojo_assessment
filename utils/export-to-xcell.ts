// ExcelExporter.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = ({
  summaryData,
  detailedData,
  fileName,
}: ExportOptions) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert summary data to worksheet
  const ws_summary = XLSX.utils.json_to_sheet(summaryData);

  // Convert detailed data to worksheet
  const ws_detailed = XLSX.utils.json_to_sheet(detailedData);

  // Append worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws_summary, "Summary");
  XLSX.utils.book_append_sheet(wb, ws_detailed, "Detailed List");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Trigger download
  saveAs(
    new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    }),
    fileName
  );
};
