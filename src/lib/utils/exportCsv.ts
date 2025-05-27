import { formatSwedishDate, MONTHS, parseDate } from "./calendarUtils";

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

  const csvParts = [`"TIDRAPPORT","KLAS","","${monthUpper} ${year}"`];

  const headers = ["KUND", "TIMMAR", "BESKRIVNING", "DATUM"];
  csvParts.push(headers.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));

  const rows = data.map((entry) => {
    const dateObj = parseDate(entry.date);

    const fullFormattedDate = formatSwedishDate(dateObj); 
    const dateWithoutYear = fullFormattedDate.replace(/\s\d{4}$/, "");

    const formattedDate = dateWithoutYear.replace(/\b\w+\b/g, (match, index) =>
      index === 0 ? match : match.toLowerCase()
    );

    return [entry.client, entry.hours, entry.description, formattedDate]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });

  csvParts.push(...rows);

  const clientMonthSummary: Record<string, Record<string, number>> = {};

  for (const entry of data) {
    const dateObj = parseDate(entry.date);
    const monthIndex = dateObj.getMonth();
    const monthLabel = MONTHS[monthIndex].toLowerCase();

    if (!clientMonthSummary[monthLabel]) clientMonthSummary[monthLabel] = {};
    if (!clientMonthSummary[monthLabel][entry.client]) {
      clientMonthSummary[monthLabel][entry.client] = 0;
    }
    clientMonthSummary[monthLabel][entry.client] += entry.hours;
  }

  const clientTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const entry of data) {
    if (!clientTotals[entry.client]) clientTotals[entry.client] = 0;
    clientTotals[entry.client] += entry.hours;
    grandTotal += entry.hours;
  }

  const totalSection = [
    "",
    '"TOTALT PER KUND"',
    '"KUND","TIMMAR"',
    ...Object.entries(clientTotals)
      .sort((a, b) => b[1] - a[1]) 
      .map(([client, hours]) => {
        return `"${client.replace(/"/g, '""')}",${hours.toFixed(1)}`;
      }),
    "",
    `"TOTALT","${grandTotal.toFixed(1)}"`,
  ];

  const csv = [...csvParts, ...totalSection].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
