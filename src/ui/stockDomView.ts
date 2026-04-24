import { fetchStocks } from "../api/stocksApi.js";

export async function initialiserInterfaceUtilisateur() {
    const selecteurActions = document.getElementById('stockSelect') as HTMLSelectElement;
    const selecteurPeriode = document.getElementById('periodSelect') as HTMLSelectElement;
    const boutonCharger = document.getElementById('loadBtn') as HTMLButtonElement;
    const zoneAffichage = document.getElementById('displayArea') as HTMLElement;

    if (!selecteurActions || !selecteurPeriode || !boutonCharger || !zoneAffichage) return;

    const symboleSauvegarde = localStorage.getItem('selectedStockSymbol');
    const periodeSauvegardee = localStorage.getItem('selectedPeriod');

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

                let contenuHtml = `<h2>${actionSelectionnee.name}</h2>`;
                contenuHtml += `<p>Secteur : ${actionSelectionnee.sector} | Prix : ${actionSelectionnee.currentPrice} ${actionSelectionnee.currency}</p>`;
                contenuHtml += `<table border="1">
                            <thead>
                                <tr><th>Date</th><th>Prix</th><th>Volume</th></tr>
                            </thead>
                            <tbody>`;

                historiqueFiltre.forEach((pointHistorique: any) => {
                    contenuHtml += `<tr><td>${pointHistorique.date}</td><td>${pointHistorique.price}</td><td>${pointHistorique.volume}</td></tr>`;
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