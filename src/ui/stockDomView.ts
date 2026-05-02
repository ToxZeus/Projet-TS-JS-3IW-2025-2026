import { ApiResponseError, InvalidApiDataError, NetworkError, fetchStocks } from "../api/stocksApi.js";
import { createStockChartManager, type SupportedChartType } from "../charts/stockMultiChart.js";
import type { StockApiItem, StocksApiResponse } from "../models/stockApi.js";
import { createToastManager } from "./toast.js";

// Utility to format iso date strings into French standard (DD/MM/YYYY).
function formatDateToFrench(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

// Get or set the state of checkboxes within the stock selection list.
function getCheckedSymbols(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-stock-symbol]')]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

// Update the visual state of checkboxes based on a list of symbols.
function setCheckedSymbols(container: HTMLElement, symbols: string[]): void {
  const selected = new Set(symbols);
  [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-stock-symbol]')].forEach((checkbox) => {
    checkbox.checked = selected.has(checkbox.value);
  });
}

// Dynamically build and render the html checklist for available stocks.
function renderStockChecklist(
  container: HTMLElement,
  stocks: StocksApiResponse,
  selectedSymbols: string[],
  onChange: () => void
): void {
  const selected = new Set(selectedSymbols);
  container.innerHTML = stocks
    .map((stock) => {
      const isChecked = selected.has(stock.symbol) ? "checked" : "";
      return `
        <label class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition">
          <input type="checkbox" data-stock-symbol="true" value="${stock.symbol}" ${isChecked} class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500">
          <span class="text-sm">${stock.name} <span class="text-gray-500">(${stock.symbol})</span></span>
        </label>
      `;
    })
    .join("");

  [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-stock-symbol]')].forEach((checkbox) => {
    checkbox.onchange = onChange;
  });
}

// Generate a unique cache key based on current filter settings.
function buildFilterKey(symbols: string[], period: number, chartType: SupportedChartType): string {
  return `${[...symbols].sort((a, b) => a.localeCompare(b)).join(",")}|${period}|${chartType}`;
}

// Map custom error classes to user-friendly messages
function getReadableErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return "Erreur réseau: vérifie ta connexion puis réessaie.";
  }
  if (error instanceof ApiResponseError) {
    return `Erreur API (${error.status}): service indisponible temporairement.`;
  }
  if (error instanceof InvalidApiDataError) {
    return "Erreur de données: le format retourné par l'API est invalide.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue est survenue.";
}

// Prepare and trigger a csv file download from the current stock data.
function escapeCsvCell(value: string | number): string {
  const text = String(value).replace(/"/g, "\"\"");
  return `"${text}"`;
}

// Generate a formatted csv string from stock history and metadata.
function buildCsvContent(stocks: StockApiItem[], period: number): string {
  const header = ["symbol", "name", "sector", "currency", "date", "price", "volume", "currentPrice"];
  const rows = stocks
    .flatMap((stock) =>
      stock.history.slice(-period).map((point) => ({
        isoDate: point.date,
        values: [
          stock.symbol,
          stock.name,
          stock.sector,
          stock.currency,
          formatDateToFrench(point.date),
          point.price,
          point.volume,
          stock.currentPrice
        ]
      }))
    )
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate))
    .map((row) => row.values);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");
}

// Create and trigger a file download for the exported csv data.
function exportStocksToCsv(stocks: StockApiItem[], period: number): void {
  const csv = buildCsvContent(stocks, period);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);

  downloadLink.href = url;
  downloadLink.download = `stocks-export-${timestamp}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

// Generate an expandable html table section for tabular data view.
function renderDetailsTable(stocks: StockApiItem[], period: number): string {
  const sections = stocks.map((stock) => {
    const rows = stock.history
      .slice(-period)
      .map(
        (point) => `
          <tr class="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <td class="p-2">${formatDateToFrench(point.date)}</td>
              <td class="p-2 font-mono">${point.price}</td>
              <td class="p-2 text-gray-400">${point.volume}</td>
          </tr>`
      )
      .join("");

    return `
      <section class="mb-6">
        <h3 class="font-semibold mb-2">${stock.name} (${stock.symbol})</h3>
        <table class="w-full text-sm text-left border-collapse mb-4">
          <thead class="bg-gray-50 dark:bg-gray-800 text-xs font-semibold">
            <tr>
              <th class="p-2 border-b dark:border-gray-700">Date</th>
              <th class="p-2 border-b dark:border-gray-700">Prix</th>
              <th class="p-2 border-b dark:border-gray-700">Volume</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  });

  return `
    <details class="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <summary class="cursor-pointer font-medium">Afficher le détail tabulaire</summary>
      <div class="mt-4">${sections.join("")}</div>
    </details>`;
}

// Main function to initialize dom elements, event listeners, and default theme.
export async function initializeUserInterface(): Promise<void> {
  // Dom element references for ui interaction and data display.
  const stockChecklistContainer = document.getElementById("stockChecklist") as HTMLElement | null;
  const selectAllButton = document.getElementById("selectAllStocksBtn") as HTMLButtonElement | null;
  const resetSelectionButton = document.getElementById("clearStocksBtn") as HTMLButtonElement | null;
  const selectionSummary = document.getElementById("stockSelectionSummary") as HTMLParagraphElement | null;
  const periodSelect = document.getElementById("periodSelect") as HTMLSelectElement | null;
  const chartTypeSelect = document.getElementById("chartTypeSelect") as HTMLSelectElement | null;
  const loadButton = document.getElementById("loadBtn") as HTMLButtonElement | null;
  const exportCsvButton = document.getElementById("exportCsvBtn") as HTMLButtonElement | null;
  const displayArea = document.getElementById("displayArea") as HTMLElement | null;
  const themeToggleButton = document.getElementById("themeToggle") as HTMLButtonElement | null;
  const toastContainer = document.getElementById("toastContainer") as HTMLElement | null;

  if (!stockChecklistContainer || !periodSelect || !chartTypeSelect || !loadButton || !displayArea) {
    return;
  }
  // Initialize notification system for user feedback.
  const toasts = createToastManager(toastContainer ?? document.body);

  // Manage ui state for theme switching and selection summary text.
  const updateSelectionSummary = (): void => {
    if (!selectionSummary) {
      return;
    }
    const symbols = getCheckedSymbols(stockChecklistContainer);
    if (!symbols.length) {
      selectionSummary.textContent = "Aucune action sélectionnée.";
      return;
    }
    selectionSummary.textContent = `${symbols.length} action${symbols.length > 1 ? "s" : ""} sélectionnée${symbols.length > 1 ? "s" : ""}: ${symbols.join(", ")}`;
  };

  if (themeToggleButton) {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }

    themeToggleButton.onclick = () => {
      const isDarkMode = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      toasts.success(isDarkMode ? "Mode sombre activé." : "Mode clair activé.");
    };
  }

  // Internal state to optimize performance and prevent redundant renders.
  let stocksCache: StocksApiResponse | null = null;
  let lastFilterKey: string | null = null;
  let lastRenderedStocks: StockApiItem[] = [];
  let lastRenderedPeriod = Number.parseInt(periodSelect.value, 10);

  const showError = (message: string): void => {
    displayArea.innerHTML = `<p class="text-red-600 dark:text-red-400">${message}</p>`;
    toasts.error(message);
  };

  const loadStocksWithCache = async (): Promise<StocksApiResponse> => {
    if (stocksCache) {
      return stocksCache;
    }

    stocksCache = await fetchStocks();
    return stocksCache;
  };

  // Initial setup: fetch data, restore preferences and perform first render.
  try {
    const availableStocks = await loadStocksWithCache();
    const savedSymbolsRaw = localStorage.getItem("selectedStockSymbols");
    const savedPeriod = localStorage.getItem("selectedPeriod");
    const savedChartType = localStorage.getItem("selectedChartType");
    const savedSymbols = savedSymbolsRaw ? savedSymbolsRaw.split(",") : [];

    const initialSymbols = savedSymbols.length > 0 ? savedSymbols : [availableStocks[0]?.symbol].filter(Boolean);
    renderStockChecklist(stockChecklistContainer, availableStocks, initialSymbols, updateSelectionSummary);

    if (savedPeriod) {
      periodSelect.value = savedPeriod;
    }

    if (savedChartType === "line" || savedChartType === "bar") {
      chartTypeSelect.value = savedChartType;
    }

    updateSelectionSummary();
  } catch (error) {
    const readableError = getReadableErrorMessage(error);
    showError(`Erreur lors du chargement de la liste des actions. ${readableError}`);
    console.error(error);
    return;
  }

  // Handle the rendering of the chart and details table based on selection.
  const renderDashboard = async (isManualTrigger = false): Promise<void> => {
    try {
      const availableStocks = await loadStocksWithCache();
      const selectedSymbols = getCheckedSymbols(stockChecklistContainer);
      const selectedPeriod = Number.parseInt(periodSelect.value, 10);
      const selectedChartType = chartTypeSelect.value as SupportedChartType;

      if (!selectedSymbols.length) {
        showError("Sélectionne au moins une action.");
        return;
      }

      // Check if filters have changed before proceeding with a new render.
      const filterKey = buildFilterKey(selectedSymbols, selectedPeriod, selectedChartType);
      if (filterKey === lastFilterKey) {
        console.info("Aucun changement de filtre, rendu conservé depuis le cache mémoire.");
        if (isManualTrigger) {
          toasts.warning("Aucun changement de filtre: affichage conservé.");
        }
        return;
      }
      displayArea.innerHTML = "<em>Chargement...</em>";

      const selectedStocks = availableStocks.filter((stock) => selectedSymbols.includes(stock.symbol));
      if (!selectedStocks.length) {
        showError("Aucune action valide sélectionnée.");
        return;
      }

      try {
        localStorage.setItem("selectedStockSymbols", selectedSymbols.join(","));
        localStorage.setItem("selectedPeriod", periodSelect.value);
        localStorage.setItem("selectedChartType", selectedChartType);
      } catch (error) {
        console.error("La sauvegarde des préférences a échoué.", error);
      }

      const header = `
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-1">Comparaison (${selectedStocks.length} action${selectedStocks.length > 1 ? "s" : ""})</h2>
          <p class="text-xs text-gray-500">Période: ${selectedPeriod} jours | Type: ${selectedChartType === "line" ? "lignes" : "barres"}</p>
        </div>
      `;
      const chartContainer = `
        <div class="w-full h-[420px] border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
          <canvas id="stockChartCanvas" aria-label="Graphique des actions sélectionnées"></canvas>
        </div>
      `;

      displayArea.innerHTML = `${header}${chartContainer}${renderDetailsTable(selectedStocks, selectedPeriod)}`;

      const canvas = document.getElementById("stockChartCanvas") as HTMLCanvasElement | null;
      if (!canvas) {
        showError("Impossible d'initialiser le graphique.");
        return;
      }

      const chartManager = createStockChartManager(canvas);
      try {
        chartManager.render(selectedStocks, selectedPeriod, selectedChartType);
      } catch (error) {
        showError("Erreur lors du rendu du graphique.");
        console.error(error);
        return;
      }
      lastRenderedStocks = selectedStocks;
      lastRenderedPeriod = selectedPeriod;
      lastFilterKey = filterKey;
      if (isManualTrigger) {
        toasts.success("Graphique mis à jour.");
      }
    } catch (error) {
      const readableError = getReadableErrorMessage(error);
      showError(`Erreur lors du chargement des données. ${readableError}`);
      console.error(error);
    }
  };

  // Bind interaction buttons for loading, exporting, and selection management.
  loadButton.onclick = () => {
    void renderDashboard(true);
  };

  // Bind interaction buttons for exporting data and managing bulk selections.

  if (exportCsvButton) {
    exportCsvButton.onclick = () => {
      if (!lastRenderedStocks.length) {
        console.error("Export CSV impossible: aucune donnée affichée.");
        toasts.warning("Aucune donnée à exporter pour le moment.");
        return;
      }
      exportStocksToCsv(lastRenderedStocks, lastRenderedPeriod);
      toasts.success("Export CSV généré avec succès.");
    };
  }

  if (selectAllButton) {
    selectAllButton.onclick = () => {
      const allSymbols = (stocksCache ?? []).map((stock) => stock.symbol);
      setCheckedSymbols(stockChecklistContainer, allSymbols);
      updateSelectionSummary();
      if (allSymbols.length > 0) {
        toasts.success(`${allSymbols.length} actions sélectionnées.`);
      }
    };
  }

  if (resetSelectionButton) {
    resetSelectionButton.onclick = () => {
      setCheckedSymbols(stockChecklistContainer, []);
      const firstSymbol = (stocksCache ?? [])[0]?.symbol;
      if (firstSymbol) {
        setCheckedSymbols(stockChecklistContainer, [firstSymbol]);
      }
      lastFilterKey = null;
      updateSelectionSummary();
      toasts.warning("Sélection réinitialisée.");
    };
  }

  void renderDashboard(false);
}

void initializeUserInterface();