import { fetchStocks } from "../api/stocksApi.js";

export async function initialiserInterfaceUtilisateur() {
    const selecteurActions = document.getElementById('stockSelect') as HTMLSelectElement;
    const selecteurPeriode = document.getElementById('periodSelect') as HTMLSelectElement;
    const boutonCharger = document.getElementById('loadBtn') as HTMLButtonElement;
    const zoneAffichage = document.getElementById('displayArea') as HTMLElement;

    if (!selecteurActions || !selecteurPeriode || !boutonCharger || !zoneAffichage) return;

    const symboleSauvegarde = localStorage.getItem('selectedStockSymbol');
    const periodeSauvegardee = localStorage.getItem('selectedPeriod');

    const boutonTheme = document.getElementById('themeToggle') as HTMLButtonElement;

    if (boutonTheme) {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        }
        
        boutonTheme.onclick = () => {
            const isDarkMode = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        };

    }

    const afficherErreur = (message: string) => {
        zoneAffichage.innerHTML = `<p>Erreur : ${message}</p>`;
    };

    try {
        const listeActions = await fetchStocks();
        selecteurActions.innerHTML = "";
        listeActions.forEach((action: any) => {
            const option = document.createElement('option');
            option.value = action.symbol;
            option.textContent = `${action.name} (${action.symbol})`;
            option.className = "bg-white text-black dark:bg-gray-800 dark:text-white";
            selecteurActions.appendChild(option);
        });
        
        if (symboleSauvegarde) selecteurActions.value = symboleSauvegarde;
        if (periodeSauvegardee) selecteurPeriode.value = periodeSauvegardee;

        if(symboleSauvegarde && periodeSauvegardee) {
            boutonCharger.click();
        }

    } catch (erreur) {
        afficherErreur("Erreur lors du chargement de la liste des actions.");
    }

    boutonCharger.onclick = async () => {
        zoneAffichage.innerHTML = "<em>Chargement...</em>";

        try {
            const listeActions = await fetchStocks();
            const symboleSelectionne = selecteurActions.value;
            const limitePeriode = parseInt(selecteurPeriode.value);
            const actionSelectionnee = listeActions.find((action: any) => action.symbol === symboleSelectionne);
            
            try {
                localStorage.setItem('selectedStockSymbol', symboleSelectionne);
                localStorage.setItem('selectedPeriod', selecteurPeriode.value);
            } catch (e) {
                console.error("La sauvegarde des préférences a échoué.");
            }

            if (actionSelectionnee) {
                const historiqueFiltre = actionSelectionnee.history.slice(-limitePeriode);

                let contenuHtml = `<h2 class="text-lg font-bold mb-1">${actionSelectionnee.name}</h2>`;
                contenuHtml += `<p class="text-xs text-gray-500 mb-4">Secteur : ${actionSelectionnee.sector} | Prix actuel : ${actionSelectionnee.currentPrice} ${actionSelectionnee.currency}</p>`;

                contenuHtml += `
                <table class="w-full text-sm text-left border-collapse">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs font-semibold">
                        <tr>
                            <th class="p-2 border-b dark:border-gray-700">Date</th>
                            <th class="p-2 border-b dark:border-gray-700">Prix</th>
                            <th class="p-2 border-b dark:border-gray-700">Volume</th>
                        </tr>
                    </thead>
                    <tbody>`;

                historiqueFiltre.forEach((point: any) => {
                    contenuHtml += `
                        <tr class="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td class="p-2">${point.date}</td>
                            <td class="p-2 font-mono">${point.price}</td>
                            <td class="p-2 text-gray-400">${point.volume}</td>
                        </tr>`;
                });

                contenuHtml += `</tbody></table>`;
                zoneAffichage.innerHTML = contenuHtml;
            }
        } catch (erreur) {
            afficherErreur("Erreur lors du chargement des données.");
            console.error(erreur);
        }
    };
}

initialiserInterfaceUtilisateur();