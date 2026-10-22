
 // Dades inicials
let productes = [
    { id: 1, nom: "Portàtil Pro", categoria: "Electrònica", preu: 950, stock: 4 },
    { id: 2, nom: "Camiseta cotó", categoria: "Roba", preu: 18, stock: 25 },
    { id: 3, nom: "Auriculars", categoria: "Electrònica", preu: 45, stock: 0 },
    { id: 4, nom: "Llibre JS Avançat", categoria: "Llibres", preu: 32, stock: 12 }
];

let estatOrdenacio = { columna: null, ascendent: true };


// MOSTRAR EL DASHBOARD
function actualitzarDashboard() {
    mostrarProductes(productes);
    actualitzarMetriques();
}


// MOSTRAR PRODUCTES A LA TAULA
function mostrarProductes(llista) {
    const tbody = document.getElementById("taula-productes");
    tbody.innerHTML = "";

    llista.forEach(prod => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${prod.id}</td>
            <td><strong>${prod.nom}</strong></td>
            <td>${prod.categoria}</td>
            <td>${prod.preu.toFixed(2)} €</td>
            <td>${prod.stock}</td>
            <td>
                <button class="btn btn-sm btn-edit"
                    onclick="carregarPerEditar(${prod.id})">
                    Editar
                </button>
                <button class="btn btn-sm btn-delete"
                    onclick="eliminarProducte(${prod.id})">
                    Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


// TASCA 1: METRIQUES (reduce, at, some, every)
function actualitzarMetriques() {

    // 1.1 Calcular el valor total de l'inventari
    const total = productes.reduce((acc, p) => {
        return acc + (p.preu * p.stock);
    }, 0);

    document.getElementById("val-total").innerText =
        `${total.toFixed(2)} €`;


    // 1.2 Obtenir l'ultim producte amb at(-1)
    const ultim = productes.at(-1);

    document.getElementById("val-ultim").innerText =
        ultim ? ultim.nom : "-";


    // 1.3 Comprovar si hi ha productes sense stock
    const teSenseStock = productes.some(p => p.stock === 0);

    document.getElementById("val-sense-stock").innerText =
        teSenseStock ? "⚠️ Manca stock" : "✅ Ok";


    // 1.4 Comprovar si tots els preus son superiors a 0
    const totsValids = productes.every(p => p.preu > 0);

    document.getElementById("val-preu-valid").innerText =
        totsValids ? "✅ Correcte" : "❌ Error";
}


// TASCA 2: AFEGIR I EDITAR PRODUCTES
document.getElementById("form-producte").addEventListener("submit", (e) => {
    e.preventDefault();

    const editId = document.getElementById("edit-id").value;

    const dadesForm = {
        nom: document.getElementById("nom").value,
        categoria: document.getElementById("categoria").value,
        preu: parseFloat(document.getElementById("preu").value),
        stock: parseInt(document.getElementById("stock").value)
    };

    if (editId) {

        // Editar un producte existent
        const idNum = parseInt(editId);

        // Trobar l'index del producte
        const index = productes.findIndex(p => p.id === idNum);

        if (index !== -1) {
            const producteEditat = {
                id: idNum,
                ...dadesForm
            };

            // Actualitzar sense modificar l'array original
            productes = productes.with(index, producteEditat);
        }

    } else {

        // 2.1 Trobar la ID mes alta
        const maxId = productes.length > 0
            ? Math.max(...productes.map(p => p.id))
            : 0;

        const nouProducte = {
            id: maxId + 1,
            ...dadesForm
        };

        // 2.2 Afegir el producte amb push
        productes.push(nouProducte);
    }

    netejarFormulari();
    actualitzarDashboard();
});


// TASCA 3: ELIMINAR PRODUCTES (findIndex i toSpliced)
function eliminarProducte(id) {

    // 3.1 Trobar l'index del producte
    const index = productes.findIndex(p => p.id === id);

    if (index !== -1) {

        // 3.2 Eliminar sense modificar l'array original
        productes = productes.toSpliced(index, 1);

        actualitzarDashboard();
    }
}


// TASCA 4: CERCAR L'ULTIM PRODUCTE PER CATEGORIA
document.getElementById("btn-cerca-last").addEventListener("click", () => {

    const cat = document.getElementById("cerca-cat-last").value;

    // Cercar des del final de l'array
    const ultimCat = productes.findLast(p => p.categoria === cat);

    if (ultimCat) {
        alert(`Darrer producte trobat de ${cat}: ${ultimCat.nom} (${ultimCat.preu}€)`);
    } else {
        alert(`No hi ha cap producte de la categoria ${cat}`);
    }
});


// TASCA 5: ORDENAR PRODUCTES (toSorted i toReversed)
document.querySelectorAll(".sortable").forEach(th => {

    th.addEventListener("click", () => {

        const columna = th.dataset.sort;

        if (estatOrdenacio.columna === columna) {
            estatOrdenacio.ascendent = !estatOrdenacio.ascendent;
        } else {
            estatOrdenacio.columna = columna;
            estatOrdenacio.ascendent = true;
        }

        // 5.1 Ordenar sense modificar l'array original
        let llistaOrdenada = productes.toSorted((a, b) => {

            if (columna === "nom") {
                return a.nom.localeCompare(b.nom);
            }

            return a[columna] - b[columna];
        });

        // 5.2 Invertir l'ordre si es descendent
        if (!estatOrdenacio.ascendent) {
            llistaOrdenada = llistaOrdenada.toReversed();
        }

        mostrarProductes(llistaOrdenada);
    });
});


// TASCA 6: CERCA I FILTRES (filter i includes)
document.getElementById("input-cerca").addEventListener("input", aplicarFiltres);
document.getElementById("filtre-categoria").addEventListener("change", aplicarFiltres);

function aplicarFiltres() {

    const text = document.getElementById("input-cerca").value.toLowerCase();
    const cat = document.getElementById("filtre-categoria").value;

    // Filtrar per nom i categoria
    const filtrats = productes.filter(p => {

        const coincideixNom = p.nom.toLowerCase().includes(text);

        const coincideixCategoria =
            cat === "Totes" || p.categoria === cat;

        return coincideixNom && coincideixCategoria;
    });

    mostrarProductes(filtrats);
}


// FUNCIO PER EDITAR UN PRODUCTE
function carregarPerEditar(id) {

    const prod = productes.find(p => p.id === id);

    if (!prod) return;

    document.getElementById("edit-id").value = prod.id;
    document.getElementById("nom").value = prod.nom;
    document.getElementById("categoria").value = prod.categoria;
    document.getElementById("preu").value = prod.preu;
    document.getElementById("stock").value = prod.stock;

    document.getElementById("form-title").innerText = "✏️ Editar Producte";
    document.getElementById("btn-submit").innerText = "Actualitzar (with)";
    document.getElementById("btn-cancel").style.display = "block";
}


// CANCEL·LAR L'EDICIO
document.getElementById("btn-cancel").addEventListener("click", netejarFormulari);


// NETEJAR EL FORMULARI
function netejarFormulari() {

    document.getElementById("form-producte").reset();
    document.getElementById("edit-id").value = "";

    document.getElementById("form-title").innerText = "➕ Afegir Producte";
    document.getElementById("btn-submit").innerText = "Guardar (push / with)";
    document.getElementById("btn-cancel").style.display = "none";
}


// INICIALITZAR EL DASHBOARD
actualitzarDashboard();
