const sessionDuration = 5 * 60 * 1000; // Durée de session de 500 minutes
let weeks = [];
let currentWeek = null; // Nouvelle variable globale pour stocker la semaine sélectionnée

// Vérification de la session
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

// Événement de clic sur le bouton de connexion
document.getElementById('loginButton').addEventListener('click', function () {
    login();
});

// Événement de pression de touche sur le mot de passe pour soumettre
document.getElementById('password').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        login();
    }
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('https://eight-brazen-workshop.glitch.me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }) // Envoie le nom d'utilisateur et le mot de passe
    })
    .then(response => {
        if (response.ok) {
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
    })
    .catch(error => {
        console.error('Error during login:', error);
    });
}
// Fonction pour récupérer les données des semaines
function fetchData() {
    const url = 'https://eight-brazen-workshop.glitch.me/api/weeks'; // Appelle ton API ici

    fetch(url)
        .then(response => response.json())
        .then(data => {
            weeks = data;
            renderWeeks();
            updateSummary();
        })
        .catch(error => {
            console.error('Error fetching weeks:', error);
        });
}

// Fonction pour afficher les semaines
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

// Fonction pour mettre à jour le résumé
function updateSummary() {
    const rentUrl = `https://eight-brazen-workshop.glitch.me/api/rent-summary`; // Ajoute ton endpoint pour les données ici
    fetch(rentUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById('weeks-rented').innerText = `Semaines Louées : ${data.weeksRented}`;
            document.getElementById('total-rent').innerText = `Total du Loyer : ${data.totalRent}€`;
        })
        .catch(error => console.error('Error fetching rent data:', error));
}

// Fonction pour afficher la modale avec les détails de la semaine
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

// Fonction de téléchargement du PDF
document.getElementById('download-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Texte du contrat
    const title = "CONTRAT DE LOCATION SAISONNIERE";
    const fontSize = 16;

    // Définir les dimensions du cadre
    const titleWidth = doc.getTextWidth(title) + 10; // Largeur du texte + un peu de marge
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2; // Centre le cadre
    const titleY = 20; // Position verticale du cadre
    const titleHeight = 10; // Hauteur du cadre

    // Dessiner le cadre
    doc.setDrawColor(0); // Couleur du cadre
    doc.rect(titleX, titleY, titleWidth, titleHeight); // Cadre

    // Définir la taille de la police et le style
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold"); // Mettre le texte en gras

    // Écrire le texte centré
    doc.text(title, titleX + 3, titleY + 7); // Centrer le texte dans le cadre
    
    doc.setFontSize(13);
    doc.setFont("arial", "bold"); 
    doc.text(`Entre les soussignés,`, 25, 45);    
    doc.setFont("arial", "normal");
    doc.setFontSize(12);
    doc.text(`M.et Mme BISSON Xavier`, 15, 55);
    doc.text(`Né le 26 mars 1976 à GISORS 27140 `, 15, 60);
    doc.text("Demeurant 74 rue de l'église 76410", 15, 65);
    doc.setFont("arial", "bold");
    doc.text('CLEON', doc.getTextWidth("Demeurant 74 rue de l'église 76410") + 15, 65);
    doc.text(`Tel : 06.86.92.05.70`, 15, 70);   
    doc.setFont("arial", "normal"); 
    doc.text(`désigné(s) ci-après`, 15, 80);
    doc.setFont("arial", "bold");
    doc.text('le bailleur', doc.getTextWidth("désigné(s) ci-après") + 15, 80);
    doc.text(`et`, 15, 90 );
    doc.setFont("arial", "normal");
    doc.text(`Mr/Mme ${currentWeek.nom}`, 15, 95);
    doc.text(`demeurant ${currentWeek.adresse}`, 15, 100);
    doc.text(`Tel portable : ${currentWeek.telephone}`, 15, 105);
    doc.text(`Mail : ${currentWeek.email}`, 15, 110);
    doc.text(`désigné(s) ci-après`, 15, 115);
    doc.setFont("arial", "bold");
    doc.text('le locataire', doc.getTextWidth("désigné(s) ci-après") + 15, 115);
    doc.text(`il est convenu d'une location meublée dont la désignation suit :`, 22, 125);
    doc.text(`Adresse du logement donné en location :`, 15, 135);
    doc.setFont("arial", "normal");
    doc.text(`Résidence VESINE`, 15, 145);
    doc.text(`Étage : 5ème et dernier....................Porte...64....................Superficie 29m2 (Loi Carrez)`, 15, 155); 
    doc.setFont("arial", "bold"); 
    doc.text(`Type du logement donné en location :`, 15, 165);
    doc.setFont("arial", "normal");
    doc.text('Appartement', 15, 170);
    textWidth = doc.getTextWidth('Appartement');
    doc.line(15, 171, 15 + textWidth, 171);
    doc.setFont("arial", "bold"); 
    doc.text(`Dépendances dont le locataire a la jouissance exclusive :`, 15, 180);
    doc.setFont("arial", "normal");
    doc.text(`Parking en sous sol n°64               Casier à ski n°64               Balcon`, 15, 185);
    doc.setFont("arial", "bold"); 
    doc.text(`Désignation des locaux et équipements privatifs (nombre de pièces, confort, etc...)`, 15, 190);
    doc.setFont("arial", "normal");
    doc.text("- T2 Séjour ouvert sur kitchenette équipée :",22, 200);
    doc.text("   Cafetière classique à filtre (café moulu), bouilloire, mini four GRILL, appareil à raclette, plancha, 2",15, 210);
    doc.text("plaques de cuisson électrique, Grille pain", 15, 215);
    doc.text("- Coin salon (1 couchage BZ 140), avec TV écran plat + 1 couchage appoint pour enfant,  ",22, 220);
    doc.text("- Une chambre séparée avec lit 140. ",22, 225);
    doc.text("- Une mezzanine avec lit de 140  ",22, 230);
    doc.text("- 1 Salle de douche  ",22, 235);
    doc.text("- 1 WC séparé  ",22, 240);
    doc.text("1 Balcon exposé PLEIN SUD avec vue panoramique sur la montagne. ",15, 250);

//Début deuxième page
doc.addPage();
doc.setFontSize(13);
doc.setFont("arial", "bold"); 
doc.text("Énumération des parties et équipements communs (ascenseur, local à vélo, escalier principal)", 15, 30);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Ascenseur, escalier principal", 15, 35);
doc.text("Obligation de mettre les skis et chaussures de ski dans le CASIER a ski en RDC prévu à cet effet.", 15, 40);
doc.text("Il est formellement interdit de monter dans l'ascenseur et de rentrer dans le logement en chaussure ", 15, 45);
doc.text("de ski ni de les stocker sur balcon ou couloir.", 15, 50); 
doc.setFontSize(13);
doc.setFont("arial", "bold"); 
doc.text("État des lieux contradictoire", 15, 70);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("L'état des lieux a fait l'objet d'un document dressé en autant d'exemplaires qu'il y a de parties", 15, 75);
doc.text("soit ....2....exemplaires. Il est annexé au présent contrat.", 15, 80); //juste les lignes
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Sanitaires :", 15, 90);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("[X] Lavabo(s)    [X] WC", 15, 95);
doc.text("[X] Douche(s)   [X] Évier un bac", 15, 100);  //juste les lignes
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Électroménager présent :", 15, 110);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("[X] Réfrigérateur    [X] Plaque cuisson    [X] Appareil à raclette    [X] Plancha", 15, 115);
doc.text("[X] Four                  [X] Micro-ondes       [X] Grille-pain                [X] Lave-vaisselle 10 couverts", 15, 120);
doc.text("[X] Aspirateur         [X] Fer à repasser     [X] TV Écran plat           [X] Cafetière Nespresso", 15, 125);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Mobilier (nombre de lits à une ou deux places, les meubles les plus importants):", 15, 135);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("• 1 Lit de 140x200 dans la chambre 1 lit BZ dans le salon (couchage 140x200, 1 lit d’appoint 70x190", 15, 140);
doc.text("• 1 lit de 140 x 200 sur la mezzanine", 15, 145);
doc.text("• ...............................................................................................................................", 15, 150);
doc.text("• ...............................................................................................................................", 15, 155);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Linge fournis :", 15, 165);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("[X] Couverture(s)             [X] Nappe(s)", 15, 175);
doc.text("[X]  Autre(s) (préciser la présence de serviettes de toilette, torchons à vaisselle, serviettes de table  ", 15, 180);
doc.text("et tout autre renseignement de nature à permettre au locataire de constituer son trousseau) ", 15, 185);
doc.setFont("arial", "bold");
doc.text('Le linge de maison n’est pas fourni ', 15, 195)
doc.setFont("arial", "normal");
doc.text('    (Torchons serviettes de toilette draps).', doc.getTextWidth("Le linge de maison n’est pas fourni") + 15, 195);
doc.text("Est fourni :", 15, 200);
doc.text('Allaise jetables pour protéger tous les matelas obligatoire a mettre en place sur l’ensemble des ', 15, 205)
doc.text('literies pour plus d’hygiène', 15, 210)
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Vaisselle", 15, 220);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("La vaisselle et les ustensiles sont suffisants pour ......7...... personnes.", 15, 225);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Réseaux fournis :", 15, 235);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("[X] Eau froide    [X] Eau chaude    [X] Chauffage électrique    [X] Sèche-serviettes Salle de Bain", 15, 240);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Inventaire contradictoire", 15, 250);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("La présente location étant consentie et acceptée en meublé, un inventaire contradictoire des meubles", 15, 255);
doc.text("sera établi lors de la remise des clés au locataire et lors de la restitution de celles-ci. L'inventaire ", 15, 260);
doc.text("sera annexé au présent contrat. Le preneur sera responsable de toute détérioration ou perte pouvant", 15, 265);
doc.text('survenir à ce mobilier.', 15, 270)

// début troisième page
doc.addPage();

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Durée de la location", 15, 20);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("La présente location est consentie et acceptée pour une durée d’une semaine (du samedi au", 15, 25);
doc.text(`samedi) : Du ${currentWeek.start} au ${currentWeek.end}`, 15, 30);
doc.text("En aucun cas, elle ne pourra être prorogée, sauf accord préalable et écrit du bailleur.", 15, 40);
doc.text("Le contrat initial ou le contrat prorogé ne pourront porter la durée de la location à plus de quatre", 15, 45);
doc.text("vingt jours maximum. Pour la prise de possession des lieux et les formalités d’usage (état des lieux,", 15, 50);
doc.text("inventaire, remise des clés, paiement des sommes prévues à cette date),", 15, 55);

doc.text("Arrivée et possession de l’appartement le samedi prévu après 16H et départ obligatoire le samedi", 15, 65);
doc.text("suivant avant 10H.", 15, 70);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Loyer / charges", 15, 80);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text(`La présente location est consentie et acceptée moyennant ${currentWeek.loyer_brut} euros charges comprises.`, 15, 85);
doc.text(`Nombre de personnes ADULTES occupant le logement (+ de 18 ans) : ${currentWeek.nb_personnes}. `, 15, 95);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Taxe de séjour", 15, 105);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text(`La taxe de séjour s’élève à 1 euro par nuitée et par adulte soit : 1 x ${currentWeek.nb_personnes} x 7 = ${currentWeek.taxe} euros qui sera remis à`, 15, 110);//faire les formules de merde...
doc.text("l’Office de Tourisme du Praz de Lys.", 15, 115);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Dépôt de garantie", 15, 125);
doc.setFont("arial", "normal");


doc.setFontSize(12);
doc.text("- A titre de garantie et en cautionnement des dégâts qui pourraient être causés au local ou bien au", 15, 130);
doc.text("mobilier et/ou aux objets garnissant les lieux, le locataire versera, à la signature de ce contrat, la", 15, 135);
doc.text("somme de (en toutes lettres): 500 euros, cinq cents euros par chèque.", 15, 140);
doc.text("Cette somme, non productive d’intérêts, sera restituée dès la preuve faite par le locataire que :", 15, 145);
doc.text("- aucun meuble, objet n’est absent, dégradé ni sali, ou bien, si tel est le cas, sa remise en état ou son ", 15, 150);
doc.text("remplacement par l’identique est convenu avec le bailleur qui l’a accepté ;", 15, 155);
doc.text("- les lieux n’ont subi aucune dégradation et sont remis en état propre (placards, poubelles et", 15, 160);
doc.text("réfrigérateurs vides de déchets, sanitaires, appareils électroménagers, vaisselle, micro onde nettoyé,", 15, 165);
doc.text("etc ...).", 15, 170);
doc.text("Si ce cautionnement s’avérait insuffisant, le locataire s’engage d’ores et déjà à en parfaire la", 15, 175);
doc.text("somme.", 15, 180);
doc.text("Destruction du dépôt de garantie 1 mois après avoir quitté le logement en accord ensemble suite à ", 15, 185);
doc.text("la restitution du logement et qu’aucun souci n’ayant été constaté.", 15, 190);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Échéancier de paiement", 15, 200);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Le jour de la signature des présentes, il est versé par le locataire la somme de :", 15, 205);
doc.text(`-   ${currentWeek.montant_arrhes} euros par virement bancaire pour la réservation (25% du montant total : ${currentWeek.calcul_harres} euros + ${currentWeek.taxe}`, 22, 215);
doc.text(`euros de Taxe de séjour) et ${currentWeek.reste_du}  euros avant le ${currentWeek.moins_un_mois} par virement bancaire.`, 26, 220);
doc.text("-   500 euros de dépôt de Garantie en chèque à la signature de ce contrat qui sera détruit au max", 22, 230);
doc.text("1 mois après la location si le logement est rendu sans aucune anomalie. (vol, casse)", 26, 235);
doc.text(`avant le ${currentWeek.plus_un_mois}.`, 25, 240);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("Élection de domicile", 15, 245);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Pour l'exécution des présentes et de leur suite, le bailleur fait élection de domicile en sa demeure et", 15, 250);
doc.text("le locataire dans les lieux loués.", 15, 255);
doc.text(`Fait à Cléon, ${currentWeek.date_contrat} en 2 originaux dont un remis au(x) locataire(s).`, 15, 260);
doc.text("Le(s) locataires(s)                  Le(s) bailleur(s)", 15, 270);
doc.text("(Faire précéder chaque signature de la mention manuscrite: \"Lu et approuvé, bon pour accord\").", 15, 275);


// Ajout de la quatrième page
doc.addPage();


doc.setFontSize(20);
doc.setFont("arial", "bold"); // Mettre la police en gras
doc.text("LES CONDITIONS GÉNÉALES DU CONTRAT", doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' }); // Centrer le texte à Y=40
doc.setFontSize(13);
doc.text("1) DUREE DU CONTRAT", 15, 60);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Le bail est consenti pour une durée fixée aux CONDITIONS PARTICULIERES du présent contrat.", 15, 65);
doc.setFont("arial", "bold");
doc.setFontSize(13);
doc.text("2) LOYER, CHARGES ET DEPOT DE GARANTIE", 15, 75);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Le montant du loyer, des charges et du dépôt de garantie sont indiqués au chapitre Loyer / charges", 15, 80);
doc.text("du présent contrat.", 15, 85);
doc.text("Des arrhes en vue de réserver le logement peuvent être demandés antérieurement.", 15, 90);
doc.text("La restitution de tout ou partie du dépôt de garantie aura lieu dans les huit jours suivant", 15, 95);
doc.text("l’établissement de l’état des lieux de sortie et de la remise", 15, 100);
doc.text("des clés en fin de séjour et sera fonction de l’état du logement.", 15, 105);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("3) OBLIGATIONS DU BAILLEUR", 15, 115);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Le bailleur est obligé :", 15, 120);
doc.text("a) de délivrer le logement en bon état d'usage et de réparation (sauf stipulation particulière", 15, 125);
doc.text("concernant les travaux pouvant être pris en charge par le locataire), ainsi que les équipements", 15, 130);
doc.text("mentionnés au présent contrat en bon état de fonctionnement.", 15, 135);
doc.text("b) d'assurer au locataire une jouissance paisible et la garantie des vices ou défauts de nature à y faire", 15, 140);
doc.text("obstacle.", 15, 145);
doc.text("d) de maintenir les locaux en état de servir à l'usage prévu par le contrat en effectuant les", 15, 150);
doc.text("réparations autres que locatives.", 15, 155);

doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("4) OBLIGATIONS DU LOCATAIRE", 15, 165);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Le locataire est obligé :", 15, 170);
doc.text("a) de payer le loyer et les charges récupérables aux termes convenus. Le paiement mensuel est de", 15, 175);
doc.text("droit si le locataire en fait la demande.", 15, 180);
doc.text("b) d'user paisiblement des locaux loués en respectant leur destination contractuelle.", 15, 185);
doc.text("c) de répondre des dégradations ou des pertes survenues pendant la durée du contrat dans les locaux", 15, 190);
doc.text("dont il a la jouissance exclusive, à moins qu’il ne prouve qu’elles ont eu lieu par cas de force", 15, 195);
doc.text("majeure, par la faute du bailleur ou par le fait d’un tiers qu’il n’a pas introduit dans le logement.", 15, 200);
doc.text("d) de prendre à sa charge l’entretien courant du logement et des équipements, les menues", 15, 205);
doc.text("réparations et l'ensemble des réparations incombant au locataire telles que définies par le décret", 15, 210);
doc.text("n°87-712 du 26 août 1987, sauf si elles sont occasionnées par vétusté, malfaçon, vice de", 15, 215);
doc.text("construction, cas fortuit ou force majeure.", 15, 220);
doc.text("e) de ne pas transformer les locaux et équipements loués.", 15, 225);
doc.text("f) de s’assurer convenablement contre les risques locatifs, l’incendie, les explosions, les dégâts des", 15, 230);
doc.text("eaux ; et à en justifier lors de la remise des clés", 15, 235);
doc.text("g) à laisser le bailleur, son mandataire ou le syndic de l’immeuble entrer dans les lieux en cas de", 15, 240);
doc.text("grandes nécessité.", 15, 245);

// Ajout de la cinquième page
doc.addPage();
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("5) CAUTIONNEMENT ", 15, 30);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Le bailleur peut souhaiter qu'un tiers se porte caution en garantissant l'exécution des obligations du", 15, 35);
doc.text("contrat de location en cas de défaillance éventuelle du locataire. A compter du 01/09/94 plusieurs ", 15, 40);
doc.text("formalités sont obligatoires sous peine d'entraîner la nullité du cautionnement. ", 15, 45);
doc.text("Le tiers qui se porte caution doit indiquer de sa main sur l'acte de caution :", 15, 50);
doc.text("- le montant du loyer ", 15, 55);
doc.text("- les conditions de sa révision, le cas échéant,", 15, 60);
doc.text("- reconnaître la nature et l’importance de l’engagement,", 15, 65);
doc.text("- indiquer la durée de l'engagement.", 15, 70);
doc.text("A défaut d'indication de durée, ou si celle-ci est stipulée indéterminée la caution peut résilier", 15, 75);
doc.text("unilatéralement son engagement. Cette résiliation après avoir été notifiée au bailleur prend effet au ", 15, 80);
doc.text("terme du contrat de location, soit à la fin du contrat initial, ou renouvelé, ou tacitement reconduit.", 15, 85);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("6) CLAUSE RESOLUTOIRE", 15, 95);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Il est expressément convenu qu'à défaut de paiement au terme convenu de tout ou partie du loyer, ", 15, 100);
doc.text("des charges du dépôt de garantie, la présente location sera résiliée de plein droit. ", 15, 105);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("7) CLAUSE PÉNALE", 15, 115);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Sans préjudice de la mise en œuvre éventuelle de la clause résolutoire et de la demande d’allocation", 15, 120);
doc.text("de dommages et intérêts, en vertu de l’article 1226 du Code civil relatif aux clauses pénales, les ", 15, 125);
doc.text("parties conviennent qu’un défaut de paiement du loyer ou des charges entraînera une majoration ", 15, 130);
doc.text("de 15% des sommes dues. Cette clause pénale produira ses effets en cas d’inaction du preneur au", 15, 135);
doc.text("delà de sept jours à compter de l’envoi, par le bailleur, d’une mise en demeure par lettre", 15, 140);
doc.text("recommandée avec AR. ", 15, 145);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("8) ETAT DES LIEUX", 15, 155);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("A défaut d'état d'entrée ou de sortie des lieux établi volontairement et contradictoirement, la partie", 15, 160);
doc.text("la plus diligente est en droit d'en faire dresser un par huissier, à frais partagés.", 15, 165);
doc.text("A défaut d'état des lieux, la présomption de l'article 1731 du Code Civil ne peut être invoquée par", 15, 170);
doc.text("celle des parties qui a fait obstacle à son établissement. ", 15, 175);
doc.text("Pendant le premier mois de la période de chauffe, le locataire peut demander que l'état des lieux soit", 15, 180);
doc.text("complété par l'état des éléments de chauffage. ", 15, 185);
doc.text("Le logement doit être rendu propre, nettoyé, poubelle vidée", 15, 190);
doc.text("Un forfait ménage de 100 euros sera déduit de la caution si cela n’est pas respecté. Encaissement", 15, 195);
doc.text("des 500 euros et restitution d’un nouveau chèque de 400 euros", 15, 200);
doc.setFontSize(13);
doc.setFont("arial", "bold");
doc.text("9) ELECTION DE DOMICILE ", 15, 2);
doc.setFont("arial", "normal");
doc.setFontSize(12);
doc.text("Pour l'exécution des obligations visées au présent contrat, le bailleur fait élection de domicile en sa", 15, 205);
doc.text("demeure et le locataire dans les lieux loués. ", 15, 210);
doc.setFontSize(13);
doc.text("10) ANNULATION", 15, 210);
doc.setFontSize(12);
doc.text("En cas d’annulation du locataire sauf en cas de force majeur celui-ci perd l’intégralité de ses arrhes", 15, 215);
doc.text("et de sa caution qui lui sera remboursée que si et seulement si un nouveau locataire occupera le", 15, 220);
doc.text("logement à cette même date.", 15, 225);
doc.text("Le blocage du pays ou de la région du locataire en cas de COVID est une FORCE MAJEUR", 15, 230);

    // Sauvegarde du document
    doc.save(`Contrat ${document.getElementById('nom-display').innerText}`);
});
