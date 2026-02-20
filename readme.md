Original prompt:

# Endura energieadviseur

Een uitgebreid webapplicatie dat uw energieverbruik analyseert en praktisch advies geeft om energiegebruik en kosten te verminderen.

## Functies

- 🔐 **OAuth2-verificatie**: Veilige aanmelding via EnergyID
- 📊 **Energieanalyse in realtime**: Analyseer verbruikspatronen zonder databaseopslag
- 📈 **Detectie piekmomenten**: Identificeer wanneer u de meeste energie verbruikt
- 🌙 **Nachtverbruiksanalyse**: Detecteer stand-by verbruik
- 🚨 **Anomaliedetectie**: Herken ongebruikelijke verbruiksstijgingen
- 💡 **Slimme aanbevelingen**: Persoonlijk advies op basis van uw patronen
- 📱 **Responsief ontwerp**: Werkt op desktop en mobiele apparaten
- ☁️ **Azure-klaar**: Direct implementeerbaar op Azure App Service

## Technologiestapel

### Backend

- **Node.js** met Express.js
- **Passport.js** voor OAuth2-authenticatie
- **Axios** voor API-aanroepen
- Realtime in-memory gegevenanalyse (geen database vereist)

### Frontend

- **Vue.js 3** met Composition API
- **Vue Router** voor navigatie
- **Vite** voor buildoptimalisatie
- **Modern CSS** met responsief ontwerp

## Projectstructuur

```
endura-energieadviseur/
├── server.js                 # Hoofdserver van Express
├── routes/
│   ├── auth.js              # OAuth2-authenticatieontwerp
│   ├── energy.js            # Routes voor energieopvraagingen
│   └── analysis.js          # Analyseëindpunten
├── services/
│   └── analysisService.js   # Energieanalysealgorithmen
├── src/
│   ├── main.js              # Vue.js entry point
│   ├── App.vue              # Root component
│   ├── style.css            # Global styles
│   ├── router/
│   │   └── index.js         # Vue Router configuration
│   └── views/
│       ├── Dashboard.vue    # Main dashboard
│       ├── Analysis.vue     # Gedetailleerde analyse
│       └── Unauthorized.vue # Pagina waarvoor verificatie vereist is
├── dist/                    # Vue.js build-uitvoer (gegenereerd)
├── package.json             # Projectafhankelijkheden
├── vite.config.js           # Vite-configuratie
├── index.html               # HTML-invoerpunt
├── web.config               # Configuratie Azure App Service
├── .env.example             # Sjabloon omgevingsvariabelen
└── README.md               # Dit bestand
```

## Installatie

### Vereisten

- Node.js 20.0.0 of hoger
- npm- of yarn-pakketbeheerder
- EnergyID OAuth2-gegevens (van https://oauth.energyid.eu) - optioneel; demo-modus beschikbaar

### Lokale installatie

1. **Kloon de repository**

```bash
git clone <repository-url>
cd endura-energieadviseur
```

2. **Installeer afhankelijkheden**

```bash
npm install
```

3. **Configureer omgevingsvariabelen**

```bash
cp .env.example .env
```

Bewerk `.env` met uw EnergyID-gegevens (optioneel):

```env
# EnergyID OAuth-configuratie (optioneel voor demo-modus)
ENERGYID_CLIENT_ID=your_client_id_here
ENERGYID_CLIENT_SECRET=your_client_secret_here
ENERGYID_CALLBACK_URL=http://localhost:3000/api/auth/callback
SESSION_SECRET=your_random_secret_here

# Demo-modus inschakelen (geen OAuth vereist)
DEMO_MODE=true
```

4. **Bouw Vue.js-frontend** (optioneel voor ontwikkeling)

```bash
npm run build
```

5. **Start de ontwikkelingserver**

```bash
npm start
```

De applicatie is beschikbaar op `http://localhost:3000`

### Ontwikkelingsmodus

Voor frontend-ontwikkeling met hot reload:

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend dev-server
npm run dev
```

## Configuratie

### Omgevingsvariabelen

Vereist (optioneel als DEMO_MODE=true wordt gebruikt):

- `ENERGYID_CLIENT_ID` - OAuth-client-ID van EnergyID
- `ENERGYID_CLIENT_SECRET` - OAuth-client-secret van EnergyID
- `SESSION_SECRET` - Willekeurige tekenreeks voor sessievercoding

Optioneel:

- `NODE_ENV` - Ingesteld op 'production' voor Azure-implementatie
- `PORT` - Serverpoort (standaard: 3000)
- `ENERGYID_CALLBACK_URL` - OAuth-callback-URL (standaard: http://localhost:3000/api/auth/callback)
- `ALLOWED_ORIGINS` - CORS toegestane oorsprongen (kommagescheiden)
- `DEMO_MODE` - Ingesteld op 'true' voor demo-modus zonder OAuth

### EnergyID OAuth-configuratie

1. Registreer uw applicatie op https://oauth.energyid.eu
2. Configureer de callback-URL zodat deze overeenkomt met uw inzet-URL
3. Voeg de vereiste scopes toe: `reading:interval_data`, `reading:calendar`
4. Kopieer de client-ID en secret naar uw `.env` bestand

## API-eindpunten

### Authenticatie

- `GET /api/auth/login` - OAuth-aanmelding starten
- `GET /api/auth/callback` - OAuth-callback-eindpunt
- `GET /api/auth/user` - Huidige gebruikersinfo ophalen
- `GET /api/auth/status` - Verificatiestatus controleren
- `GET /api/auth/logout` - Gebruiker uitloggen
- `GET /api/auth/demo-login` - Demo-modus aanmelden (geen OAuth vereist)
- `GET /api/auth/demo-status` - Demo-modus beschikbaarheid controleren

### Energiegegevens

- `GET /api/energy/consumption?days=30` - Verbruiksgegevens ophalen
- `GET /api/energy/today` - Verbruik van vandaag opvragen
- `GET /api/energy/meters` - Metergegevens opvragen

### Analyse

- `POST /api/analysis/analyze` - Volledige analyse van verbruiksgegevens
- `POST /api/analysis/summary` - Samengevatte statistieken berekenen
- `POST /api/analysis/anomalies` - Uitbijters detecteren
- `POST /api/analysis/peak-hours` - Piekmomenten analyseren
- `POST /api/analysis/night-consumption` - Energieverbruik in rust analyseren

## Analysefuncties

### Detectie piekmomenten

Identificeert uren met het hoogste energieverbruik en biedt aanbevelingen voor verschuiving van belasting.

### Analyse nachtverbruik

Analyseert stand-by/rustverbruik tijdens uren met laag verbruik om mogelijke energieverbruik te identificeren.

### Detectie afwijkingen

Gebruikt statistische methoden (Z-score-analyse) om ongebruikelijke verbruikspatronen te detecteren die mogelijke apparatuuren kunnen aangeven.

### Slimme aanbevelingen

Biedt persoonlijk advies op basis van:

- Rustverbruiksniveaus
- Piekuurpatronen
- Verbruikstrends
- Gedetecteerde afwijkingen

## Implementatie op Azure App Service

### Vereisten

- Azure-abonnement
- Azure CLI geïnstalleerd en geconfigureerd
- Web.config-bestand (opgenomen in het project)

### Implementatiestappen

1. **Bouw de applicatie**

```bash
npm run build:all
```

2. **Maak Azure App Service**

```bash
az group create --name endura-energieadviseur-rg --location eastus
az appservice plan create --name endura-energieadviseur-plan --resource-group endura-energieadviseur-rg --sku B1
az webapp create --resource-group endura-energieadviseur-rg --plan endura-energieadviseur-plan --name endura-energieadviseur --runtime "NODE|18"
```

3. **Configureer omgevingsvariabelen in Azure**

```bash
az webapp config appsettings set --resource-group endura-energieadviseur-rg --name endura-energieadviseur --settings \
  ENERGYID_CLIENT_ID="your_client_id" \
  ENERGYID_CLIENT_SECRET="your_client_secret" \
  SESSION_SECRET="your_session_secret" \
  NODE_ENV="production" \
  DEMO_MODE="true"
```

4. **Implementeer met Git**

```bash
az webapp deployment user set --user-name <username> --password <password>
git remote add azure <git-clone-url>
git push azure main
```

Of gebruik **ZIP-implementatie**:

```bash
zip -r deployment.zip . -x "*.git*" "node_modules/*" "dist/*" ".env"
az webapp deployment source config-zip --resource-group endura-energieadviseur-rg --name endura-energieadviseur --src deployment.zip
```

5. **Controleer implementatie**

```bash
https://endura-energieadviseur.azurewebsites.net
```

## Prestatieoverwegingen

- **Analyse in realtime**: Alle berekeningen worden in het geheugen uitgevoerd, wat snelle reactietijden garandeert
- **Caching**: Sessiebeheer met cookies voor snellere volgende aanvragen
- **Compressie**: Gzip-compressie ingeschakeld voor alle reacties
- **Beveiligingsheaders**: Helmet.js voor beveiligingsheaders

## Beveiliging

- ✅ HTTPS afgedwongen op productie-implementaties
- ✅ Veilige sessiecookies (HttpOnly, Secure-vlaggen)
- ✅ CORS-bescherming
- ✅ OAuth2-authenticatie
- ✅ Demo-modus voor testen zonder OAuth vereist
- ✅ Geen gevoelige gegevens lokaal opgeslagen

## Probleemoplossing

### OAuth-aanmelding werkt niet

- Controleer `ENERGYID_CLIENT_ID` en `ENERGYID_CLIENT_SECRET`
- Controleer of callback-URL overeenkomt met configuratie in EnergyID
- Zorg ervoor dat OAuth-scopes `reading:interval_data` bevatten

### Geen energiegegevens

- Controleer of EnergyID-account gekoppelde meters heeft
- Controleer of OAuth-token niet is verlopen
- Bevestig dat datumbereik in API-aanroepen geldig is

### Build-fouten op Azure

- Zorg ervoor dat Node.js-versie overeenkomt met Azure-runtime
- Voer `npm run build:all` eerst lokaal uit
- Controleer dat alle afhankelijkheden in package.json staan (niet package-lock.json)

## Toekomstige verbeteringen

- [ ] Historische gegevensopslag voor trendanalyse
- [ ] Machine learning voor voorspellende aanbevelingen
- [ ] Mobiele app (React Native/Flutter)
- [ ] E-mailwaarschuwingen voor afwijkingen in verbruik
- [ ] Vergelijking met vergelijkbare huizen/wijken
- [ ] Integratie met slimthuis-systemen
- [ ] Exportrapporten (PDF/CSV)

## Bijdragen

Bijdragen zijn welkom! Volg deze stappen:

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit wijzigingen (`git commit -m 'Add amazing feature'`)
4. Push naar branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## Licentie

Dit project is gelicentieerd onder de MIT-licentie - zie het LICENSE-bestand voor details.

## Ondersteuning

Voor vragen en problemen:

- Controleer de sectie [Probleemoplossing](#probleemoplossing)
- Bekijk EnergyID API-documentatie
- Open een issue op de repository

## Dankbetuigingen

- [EnergyID](https://www.energyid.eu) voor API-toegang
- [Vue.js](https://vuejs.org) team voor het uitstekende framework
- [Express.js](https://expressjs.com) community
