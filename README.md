# Sportvereniging Fit & Fair - Website

Een eenvoudige maar betrouwbare website voor Sportvereniging Fit & Fair voor het beheren van activiteiten en aanmeldingen.

## Functies

### Voor leden en geïnteresseerden:
- **Activiteitenoverzicht**: Bekijk alle geplande trainingen, toernooien en open dagen
- **Activiteitdetails**: Klik op een activiteit voor meer informatie
- **Online aanmelden**: Eenvoudig aanmelden voor activiteiten via een formulier
- **Bevestiging**: Directe bevestiging na succesvolle aanmelding

### Voor beheerders:
- **Activiteiten beheren**: Nieuwe activiteiten toevoegen, bewerken en verwijderen
- **Aanmeldingen overzicht**: Bekijk alle aanmeldingen per activiteit
- **Deelnemersbeheer**: Overzicht van deelnemers met contactgegevens
- **Capaciteitsbeheer**: Stel maximum aantal deelnemers per activiteit in

## Technische specificaties

### Database Schema (ERD)

#### Tabel: Activities
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `title` (TEXT, NOT NULL) - Titel van de activiteit
- `description` (TEXT) - Beschrijving van de activiteit
- `date` (TEXT, NOT NULL) - Datum van de activiteit
- `time` (TEXT) - Tijd van de activiteit
- `location` (TEXT) - Locatie van de activiteit
- `max_participants` (INTEGER) - Maximum aantal deelnemers
- `type` (TEXT, CHECK: 'training', 'toernooi', 'open dag') - Type activiteit
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

#### Tabel: Registrations
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `activity_id` (INTEGER, NOT NULL, FOREIGN KEY → activities.id)
- `name` (TEXT, NOT NULL) - Naam van de deelnemer
- `email` (TEXT, NOT NULL) - E-mailadres van de deelnemer
- `phone` (TEXT) - Telefoonnummer van de deelnemer
- `registration_date` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### Relaties
- Een `Activity` kan meerdere `Registrations` hebben (1:N relatie)
- Als een activiteit wordt verwijderd, worden alle bijbehorende aanmeldingen ook verwijderd (CASCADE DELETE)

## Installatie en gebruik

### Vereisten
- Node.js (versie 14 of hoger)
- npm (Node Package Manager)

### Installatie
1. Clone of download het project
2. Navigeer naar de projectmap:
   ```bash
   cd sportvereniging-fit-fair
   ```
3. Installeer de benodigde packages:
   ```bash
   npm install
   ```
4. Initialiseer de database:
   ```bash
   node database/setup.js
   ```
5. Start de server:
   ```bash
   npm start
   ```

### Gebruik
- Open uw browser en navigeer naar `http://localhost:3000`
- Voor beheer: ga naar `http://localhost:3000/admin`

## Projectstructuur
```
sportvereniging-fit-fair/
├── database/
│   ├── setup.js              # Database initialisatie
│   └── sportvereniging.db   # SQLite database
├── public/
│   ├── index.html           # Hoofdpagina voor leden
│   └── admin.html           # Beheerpagina
├── css/
│   └── style.css            # Styling voor alle pagina's
├── js/
│   ├── main.js              # Functionaliteit hoofdpagina
│   └── admin.js             # Functionaliteit beheerpagina
├── server.js                # Express server en API endpoints
├── package.json             # Project dependencies
└── README.md               # Deze documentatie
```

## API Endpoints

### Activiteiten
- `GET /api/activities` - Alle activiteiten ophalen
- `GET /api/activities/:id` - Specifieke activiteit ophalen
- `POST /api/activities` - Nieuwe activiteit toevoegen
- `DELETE /api/activities/:id` - Activiteit verwijderen

### Aanmeldingen
- `GET /api/activities/:id/registrations` - Aanmeldingen voor activiteit ophalen
- `POST /api/activities/:id/register` - Aanmelden voor activiteit

## Features

### Beveiliging
- Validatie van input data
- Capaciteitscontrole (geen aanmeldingen mogelijk als vol)
- SQL injection preventie via parameterized queries

### Gebruiksvriendelijkheid
- Responsive design voor desktop en mobiel
- Duidelijke foutmeldingen en bevestigingen
- Intuïtieve navigatie
- Moderne UI met hover effects en smooth scrolling

### Betrouwbaarheid
- SQLite database voor dataopslag
- Error handling op alle niveaus
- Cascading deletes voor dataintegriteit

## Onderhoud
- De database wordt automatisch aangemaakt bij eerste run
- Back-ups van de database kunnen handmatig worden gemaakt
- Logs worden weergegeven in de console

## Contact
- Project ontwikkeld voor Sportvereniging Fit & Fair
- Contactpersoon: Mevrouw M. de Groot (secretaris)
