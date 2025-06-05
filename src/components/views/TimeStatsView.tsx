import { useTimeStats } from "@hooks/useTimeStats";
import { exportToCsv } from "@lib/utils/exportCsv";
import type { Session } from "@supabase/supabase-js";
import React from "react";

type TimeStatsProps = {
  initialSession: Session | null;
  selectedMonth?: Date; 
};

const TimeStats: React.FC<TimeStatsProps> = ({ initialSession, selectedMonth }) => {
  const { $stats: timeStats, $monthEntries } = useTimeStats(initialSession, selectedMonth);

  const handleExport = () => {
    const exportData = $monthEntries.map((entry) => ({
      client: timeStats.clientDistribution.find((p) => p.id === entry.client_id)?.name || "Okänt projekt",
      hours: entry.hours,
      description: entry.description || "",
      date: entry.date ? new Date(entry.date).toLocaleDateString("sv-SE") : "",
    }));

    const dateForFilename = selectedMonth ?? new Date();
    const month = dateForFilename.toLocaleString("sv-SE", { month: "long" });
    const filename = `tidrapportering-klas-${month}.csv`;

    exportToCsv(exportData, filename, selectedMonth);
  };

  return (
    <section className="time-entries / h-1/2 p-base flex flex-col justify-between gap-base overflow-y-auto">
      <div className="flow">
        <div className="flow-sm">
          <p>Tidsstatistik per:</p>
          <ul className="flex flex-col">
            {[
              { title: "Idag", hours: timeStats.today.toFixed(1) },
              { title: "Månad", hours: timeStats.month.toFixed(1) },
              { title: "År", hours: timeStats.year.toFixed(1) },
            ].map(({ title, hours }) => ( 
              <li key={title} className="flex items-end justify-between hover:bg-hover transition-colors gap-0.5">
                <span>{title}</span>
                <span className="dot-leaders flex-1 leading-none" />
                <time className="tabular-nums">{hours}h</time>
              </li>
            ))}
          </ul>
        </div>
        <div className="flow-sm">
          <p>Fördelning per kund:</p>
          {timeStats.clientDistribution.length === 0 ? (
            <p className="text-pretty">Ingen loggad tid denna månad.</p>
          ) : (
            <ul className="flex flex-col">
              {timeStats.clientDistribution.map(({ id, name, hours }) => (
                <li key={id} className="flex items-end justify-between hover:bg-hover transition-colors gap-0.5">
                  <span>{name}</span>
                  <span className="dot-leaders flex-1 leading-none" />
                  <time className="tabular-nums">{hours.toFixed(1)}h</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="pt-sm">
          <button
            onClick={handleExport}
            aria-controls="export-stats-modal"
            className="button w-full"
            data-variant="white">
            Exportera statistik
          </button>
      </div>
    </section>
  );
};

export default TimeStats;
