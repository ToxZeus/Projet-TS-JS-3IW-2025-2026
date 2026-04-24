import { fetchStocks } from "../api/stocksApi.js";

export async function initialiserInterfaceUtilisateur() {
    const selecteurActions = document.getElementById('stockSelect');
    const selecteurPeriode = document.getElementById('periodSelect');
    const boutonCharger = document.getElementById('loadBtn');
    const zoneAffichage = document.getElementById('displayArea');

    if (!selecteurActions || !boutonCharger || !zoneAffichage) return;

    const afficherErreur = (message) => {
        zoneAffichage.innerHTML = `<p>Erreur : ${message}</p>`;
    };

    try {
        const listeActions = await fetchStocks();
        selecteurActions.innerHTML = "";
        listeActions.forEach(action => {
            const option = document.createElement('option');
            option.value = action.symbol;
            option.textContent = `${action.name} (${action.symbol})`;
            selecteurActions.appendChild(option);
        });
    } catch (erreur) {
        afficherErreur("Erreur lors du chargement de la liste des actions.");
    }

    boutonCharger.onclick = async () => {
        zoneAffichage.innerHTML = "<em>Chargement...</em>";

        try {
            const listeActions = await fetchStocks();
            const symboleSelectionne = selecteurActions.value;
            const limitePeriode = parseInt(selecteurPeriode.value);
            const actionSelectionnee = listeActions.find(action => action.symbol === symboleSelectionne);

            if (actionSelectionnee) {
                const historiqueFiltre = actionSelectionnee.history.slice(-limitePeriode);

                let contenuHtml = `<h2>${actionSelectionnee.name}</h2>`;
                contenuHtml += `<p>Secteur : ${actionSelectionnee.sector} | Prix : ${actionSelectionnee.currentPrice} ${actionSelectionnee.currency}</p>`;
                contenuHtml += `<table border="1">
                            <thead>
                                <tr><th>Date</th><th>Prix</th><th>Volume</th></tr>
                            </thead>
                            <tbody>`;

                historiqueFiltre.forEach(pointHistorique => {
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