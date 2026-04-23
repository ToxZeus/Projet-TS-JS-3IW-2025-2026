const STOCKS_API_URL = "https://keligmartin.github.io/api/stocks.json";

async function fetchStocks() {
    const response = await fetch(STOCKS_API_URL, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

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
            const symbole = selecteurActions.value;
            const limite = parseInt(selecteurPeriode.value);
            const actionSelectionnee = listeActions.find(a => a.symbol === symbole);

            if (actionSelectionnee) {
                const historique = actionSelectionnee.history.slice(-limite);

                let html = `<h2>${actionSelectionnee.name}</h2>`;
                html += `<p>Secteur : ${actionSelectionnee.sector} | Prix : ${actionSelectionnee.currentPrice} ${actionSelectionnee.currency}</p>`;
                html += `<table border="1">
                            <thead>
                                <tr><th>Date</th><th>Prix</th><th>Volume</th></tr>
                            </thead>
                            <tbody>`;

                historique.forEach(h => {
                    html += `<tr><td>${h.date}</td><td>${h.price}</td><td>${h.volume}</td></tr>`;
                });

                html += `</tbody></table>`;
                zoneAffichage.innerHTML = html;
            }
        } catch (erreur) {
            afficherErreur("Erreur lors du chargement des données.");
            console.error(erreur);
        }
    };
}

initialiserInterfaceUtilisateur();