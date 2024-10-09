const correctUsers = {
    Xavière: 'emilienbisson76',
    Milou: 'Lecodeur76',
    Nonola: 'Elfymacherie76',
    Daronne: 'Miloulebest'
};

const sessionDuration = 500 * 60 * 1000;
const SHEET_ID = '177w2qcJ2ScMXB6m-WkkJESGoRl_r9FtxhnineuyjmRE'; // ID de la feuille Google Sheets
const API_KEY = 'AIzaSyAEeiHh74hDUPTijbwP0MxvrBaWQbw4V-I'; // Clé API
const DATA_RANGE = 'TKT!A2:Z28'; // Plage de données à récupérer
const WEEKS_RENTED_CELL = 'TKT!R30'; // Cellule pour les semaines louées
const TOTAL_RENT_CELL = 'TKT!R31'; // Cellule pour le total du loyer
let weeks = [];
let currentWeek = null; // Nouvelle variable globale pour stocker la semaine sélectionnée

const sessionData = localStorage.getItem('session');
if (sessionData) {
    const session = JSON.parse(sessionData);
    if (new Date().getTime() - session.timestamp < sessionDuration) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('calendarContainer').style.display = 'block';
        fetchData();
    } else {
        localStorage.removeItem('session');
    }
}

document.getElementById('loginButton').addEventListener('click', function () {
    login();
});

document.getElementById('password').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        login();
    }
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (correctUsers[username] === password) {
        const session = {
            timestamp: new Date().getTime()
        };
        localStorage.setItem('session', JSON.stringify(session));
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('calendarContainer').style.display = 'block';
        fetchData();
    } else {
        document.getElementById('errorMessage').innerText = 'Nom d’utilisateur ou mot de passe incorrect.';
    }
}

function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${DATA_RANGE}?key=${API_KEY}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de réseau');
            }
            return response.json();
        })
        .then(data => {
            weeks = data.values.map((row, index) => ({
                semaine: row[0],
                start: row[1],
                end: row[2],
                nom: row[3],
                telephone: row[4],
                adresse: row[5],
                email: row[6],
                support: row[7],
                nb_personnes: row[8],
                taxe: row[9],
                loyer_brut: row[10],
                loyer_total: row[11],
                montant_arrhes: row[12],
                reste_du: row[13],
                date_paiement: row[14],
                contrat_envoye: row[15],
                retour_contrat: row[16],
                caution_recue: row[17],
                attestation_assurance: row[18],
                valide: row[19],
                date_contrat: row[20],
                calcul_harres: row[21],
                moins_un_mois: row[22],
                plus_un_mois: row[23],
                index: index + 2
            }));
            renderWeeks();
            updateSummary();
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error.message);
        });
}

function renderWeeks() {
    const weekList = document.getElementById('week-list');
    weekList.innerHTML = '';

    weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');
        if (week.nom && week.valide == '0') {
            weekDiv.classList.add('quasi-louee');
        } else if (week.nom && week.valide == '1') {
            weekDiv.classList.add('louee');
        } else {
            weekDiv.classList.add('disponible');
        }
        weekDiv.innerText = `Semaine ${week.semaine} (${week.start} - ${week.end})`;
        weekDiv.addEventListener('click', function () {
            showModal(week);
        });
        weekList.appendChild(weekDiv);
    });
}

function updateSummary() {
    const rentUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${WEEKS_RENTED_CELL}?key=${API_KEY}`;
    fetch(rentUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById('weeks-rented').innerText = `Semaines Louées : ${data.values[0][0]}`;
        });

    const totalRentUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TOTAL_RENT_CELL}?key=${API_KEY}`;
    fetch(totalRentUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-rent').innerText = `Total du Loyer : ${data.values[0][0]}€`;
        });
}

function showModal(week) {
    currentWeek = week; // Stocke la semaine sélectionnée dans la variable globale

    // Remplissage de la modale avec les données
    document.getElementById('week-display').innerText = week.semaine;
    document.getElementById('start-display').innerText = week.start;
    document.getElementById('end-display').innerText = week.end;
    document.getElementById('nom-display').innerText = week.nom || 'Non renseigné';
    document.getElementById('telephone-display').innerText = week.telephone || 'Non renseigné';
    document.getElementById('adresse-display').innerText = week.adresse || 'Non renseigné';
    document.getElementById('email-display').innerText = week.email || 'Non renseigné';
    document.getElementById('support-display').innerText = week.support || 'Non renseigné';
    document.getElementById('nb-personnes-display').innerText = week.nb_personnes || 'Non renseigné';
    document.getElementById('loyer-total-display').innerText = week.loyer_total || '0';
    document.getElementById('date-paiement-display').innerText = week.date_paiement || 'Non renseigné';
    document.getElementById('contrat-envoye-display').innerText = week.contrat_envoye == '1' ? 'Oui' : 'Non';
    document.getElementById('retour-contrat-display').innerText = week.retour_contrat == '1' ? 'Oui' : 'Non';
    document.getElementById('caution-recue-display').innerText = week.caution_recue == '1' ? 'Oui' : 'Non';
    document.getElementById('attestation-assurance-display').innerText = week.attestation_assurance == '1' ? 'Oui' : 'Non';
    document.getElementById('valide-display').innerText = week.valide === '1' ? 'Oui' : 'Non';

    document.getElementById('modal').style.display = 'flex';
}

// Ajouter l'événement de fermeture de la modale
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none'; // Cache la modale
});

// Fonction pour générer le PDF
document.getElementById("generatePdfBtn").addEventListener("click", generatePdf);
function generatePdf() {
    const { jsPDF } = window.jspdf; // Importer jsPDF
    const doc = new jsPDF('portrait', 'mm', 'a4'); // Configurer le PDF en portrait A4

    const title = "CONTRAT DE LOCATION SAISONNIERE";
    const fontSize = 16;
    const titleWidth = doc.getTextWidth(title) + 10;
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    const titleY = 20;
    const titleHeight = 10;
    doc.setDrawColor(0);
    doc.rect(titleX, titleY, titleWidth, titleHeight);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    doc.text(title, titleX + 3, titleY + 7);
    doc.setFontSize(13);
    doc.setFont("arial", "bold"); 
    doc.text(`Entre les soussignés,`, 25, 45);    
    doc.setFont("arial", "normal");

    // Créer une nouvelle page pour l'image
    doc.addPage(); // Ajoute une nouvelle page

    // Charger l'image
    const img = new Image();
    img.src = 'image2.png'; // Chemin de ton image

    img.onload = function() {
        // Ajouter l'image à la deuxième page
        doc.addImage(img, 'PNG', 0, 0, 210, 297); // x, y, width, height

        // Sauvegarder le PDF
        doc.save('Releve_Identite_Bancaire.pdf');
    };

    img.onerror = function() {
        console.error("L'image n'a pas pu être chargée. Vérifiez le chemin.");
    };
}
