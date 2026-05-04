import Chart from "chart.js/auto";
import type { ChartDataset } from "chart.js";
import type { StockApiItem } from "../models/stockApi.js";

export type SupportedChartType = "line" | "bar";

type DatasetByDate = Map<string, number>;

type PreparedStockHistory = {
  stock: StockApiItem;
  pricesByDate: DatasetByDate;
  volumesByDate: DatasetByDate;
};

type StockChartManager = {
  render: (stocks: StockApiItem[], periodInDays: number, chartType: SupportedChartType) => void;
};

// Helper to apply opacity to hsl color strings for chart backgrounds.
function withAlpha(hslColor: string, alpha: number): string {
  return hslColor.replace("hsl(", "hsla(").replace(")", `, ${alpha})`);
}

// Generate distinct colors based on the number of stocks to display.
function createPaletteColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1));
  return `hsl(${hue}, 70%, 48%)`;
}

// Convert iso date strings to French format (DD/MM/YYYY).
function formatDateToFr(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

// Extract and map stock history data for a specific time period.
function prepareStockHistory(stock: StockApiItem, periodInDays: number): PreparedStockHistory {
  const historySlice = stock.history.slice(-periodInDays);
  return {
    stock,
    pricesByDate: new Map(historySlice.map((point) => [point.date, point.price])),
    volumesByDate: new Map(historySlice.map((point) => [point.date, point.volume]))
  };
}

// Build a sorted unique list of all dates present across multiple stock histories.
function collectUnifiedDates(histories: PreparedStockHistory[]): string[] {
  const uniqueDates = new Set<string>();

  histories.forEach((history) => {
    history.pricesByDate.forEach((_value, date) => uniqueDates.add(date));
  });

  return [...uniqueDates].sort((a, b) => a.localeCompare(b));
}

// Transform history data into Chart.js dataset objects for price and volume.
function createDatasets(
  histories: PreparedStockHistory[],
  labels: string[],
  chartType: SupportedChartType
): ChartDataset<"line" | "bar", (number | null)[]>[] {
  return histories.flatMap((history, index) => {
    const color = createPaletteColor(index, histories.length);
    const chartDatasetType = chartType === "bar" ? "bar" : "line";

    const priceDataset: ChartDataset<"line" | "bar", (number | null)[]> = {
      type: chartDatasetType,
      label: `${history.stock.symbol} - Prix`,
      data: labels.map((date) => history.pricesByDate.get(date) ?? null),
      yAxisID: "yPrice",
      borderColor: color,
      backgroundColor: withAlpha(color, chartType === "bar" ? 0.5 : 0.2),
      borderWidth: chartType === "bar" ? 1 : 2.5,
      tension: 0.25,
      pointRadius: chartType === "bar" ? 0 : 2,
      pointHoverRadius: 4,
      order: 1
    };

    const volumeDataset: ChartDataset<"line" | "bar", (number | null)[]> = {
      type: chartDatasetType,
      label: `${history.stock.symbol} - Volume`,
      data: labels.map((date) => history.volumesByDate.get(date) ?? null),
      yAxisID: "yVolume",
      borderColor: color,
      backgroundColor: withAlpha(color, chartType === "bar" ? 0.18 : 0.05),
      borderWidth: chartType === "bar" ? 1 : 2,
      borderDash: chartType === "line" ? [8, 6] : [],
      tension: 0.2,
      pointRadius: 0,
      pointHoverRadius: 0,
      order: 2
    };

    return [priceDataset, volumeDataset];
  });
}

// Create a manager to handle rendering and updating the multi-series chart.
export function createStockChartManager(canvas: HTMLCanvasElement): StockChartManager {
  let chart: Chart<"line" | "bar", (number | null)[], string> | null = null;

  return {
    render(stocks: StockApiItem[], periodInDays: number, chartType: SupportedChartType): void {
      const histories = stocks.map((stock) => prepareStockHistory(stock, periodInDays));
      const rawLabels = collectUnifiedDates(histories);
      const labels = rawLabels.map((date) => formatDateToFr(date));
      const datasets = createDatasets(histories, rawLabels, chartType);

      chart?.destroy();
      chart = new Chart<"line" | "bar", (number | null)[], string>(canvas, {
        type: "line",
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 500,
            easing: "easeOutQuart"
          },
          interaction: {
            mode: "index",
            intersect: false
          },
          normalized: true,
          spanGaps: false,
          elements: {
            line: {
              fill: false
            }
          },
          scales: {
            x: {
              grid: {
                color: "rgba(148, 163, 184, 0.15)"
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 8,
                maxRotation: 0
              }
            },
            yPrice: {
              type: "linear",
              position: "left",
              title: {
                display: true,
                text: "Prix"
              },
              grid: {
                color: "rgba(148, 163, 184, 0.15)"
              },
              ticks: {
                callback: (value) => `${value} $`
              }
            },
            yVolume: {
              type: "linear",
              position: "right",
              title: {
                display: true,
                text: "Volume"
              },
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                callback: (value) => Number(value).toLocaleString("fr-FR")
              }
            }
          },
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                boxWidth: 10,
                boxHeight: 10
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y;
                  const label = context.dataset.label ?? "";
                  if (value === null || value === undefined) {
                    return `${label}: n/a`;
                  }
                  if (label.includes("Volume")) {
                    return `${label}: ${Number(value).toLocaleString("fr-FR")}`;
                  }
                  return `${label}: ${value.toLocaleString("fr-FR")} $`;
                }
              }
            }
          }
        }
      });
    }
  };
}
