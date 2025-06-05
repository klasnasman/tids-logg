import { formatSwedishDate, parseDate } from "./calendarUtils";

type EntryExport = {
  client: string;
  hours: number;
  description: string;
  date: string;
};

export function exportToCsv(data: EntryExport[], filename = "tidrapportering.csv", selectedMonth?: Date) {
  const dateForHeader = selectedMonth ?? new Date();
  const monthUpper = dateForHeader.toLocaleString("sv-SE", { month: "long" }).toUpperCase();
  const year = String(dateForHeader.getFullYear());

  const csvParts: string[] = [];

  // HEADER
  csvParts.push(`"TIDRAPPORT ${monthUpper} ${year}", "", KLAS`);
  csvParts.push("");

  // DATA
  const headers = ["KUND", "TIMMAR", "BESKRIVNING", "DATUM"];
  csvParts.push(headers.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));

  const rows = data.map((entry) => {
    const dateObj = parseDate(entry.date);
    const fullFormattedDate = formatSwedishDate(dateObj); 
    const dateForExcel = fullFormattedDate.substring(0, fullFormattedDate.lastIndexOf(" "));

    return [entry.client, entry.hours, entry.description, dateForExcel]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });
  csvParts.push(...rows);
  csvParts.push("");

  // TOTALS
  const clientTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const entry of data) {
    if (!clientTotals[entry.client]) clientTotals[entry.client] = 0;
    clientTotals[entry.client] += entry.hours;
    grandTotal += entry.hours;
  }

  csvParts.push(`"TOTALT PER KUND"`);
  csvParts.push(`"KUND","TIMMAR"`);
  Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([client, hours]) => {
      csvParts.push(`"${client.replace(/"/g, '""')}",${hours.toFixed(1)}`);
    });

  csvParts.push("");

  csvParts.push(`"TOTAL","${grandTotal.toFixed(1)}"`);

  const csv = csvParts.join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
