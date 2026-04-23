const API_URL = "https://keligmartin.github.io/api/stocks.json";

export async function initialiserInterface() {
    const btn = document.getElementById('loadBtn');
    const display = document.getElementById('displayArea');

    if (!btn || !display) return;

    btn.onclick = async () => {
        display.innerHTML = "Chargement...";

        try {
            const response = await fetch(API_URL);
            const stocks = await response.json();

            const symbol = (document.getElementById('stockSelect') as HTMLSelectElement).value;
            const limit = parseInt((document.getElementById('periodSelect') as HTMLSelectElement).value);

            const selected = stocks.find((s: any) => s.symbol === symbol);

            if (selected) {
                const history = selected.history.slice(-limit);

                let html = `<h2>${selected.name}</h2>`;
                html += `<table border="1">
                            <thead><tr><th>Date</th><th>Prix</th></tr></thead>
                            <tbody>`;

                history.forEach((h: any) => {
                    html += `<tr><td>${h.date}</td><td>${h.price}</td></tr>`;
                });

                html += `</tbody></table>`;
                display.innerHTML = html;
            }
        } catch (error) {
            display.innerHTML = "Erreur de connexion.";
        }
    };
}
initialiserInterface();