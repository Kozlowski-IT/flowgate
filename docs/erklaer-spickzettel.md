# FlowGate — Erklär-Spickzettel (für Gespräche & Interviews)

> 15-Minuten-Lektüre. Jedes Thema: **Was es ist → Wie du es erklärst (2–3 Sätze) → Wo es im Code liegt.**
> Die mit 🧑‍💻 markierten Stellen hast du (mit)geschrieben — die kannst du als „hab ich selbst implementiert" erzählen.

---

## 0. Der Projekt-Pitch (30 Sekunden)

> „FlowGate ist ein Antrags- und Freigabe-Workflow, wie ihn Firmen intern nutzen: Mitarbeiter stellen Anträge, Reviewer prüfen und entscheiden, alles wird revisionssicher protokolliert. Full-Stack: Angular mit Signals und Reactive Forms im Frontend, NestJS mit Domain-Driven Design im Backend, PostgreSQL, Echtzeit-Updates per WebSocket. Selbst gebaut als Referenzprojekt, deployed mit Docker hinter nginx."

---

## 1. Authentifizierung — JWT (Phase 2)

**Was:** Beim Login prüft der Server E-Mail+Passwort (bcrypt-Hash-Vergleich) und stellt ein **JWT** aus — einen signierten „Ausweis" mit User-ID, E-Mail, Rolle und Ablaufzeit. Das Frontend schickt ihn bei jeder Anfrage als `Authorization: Bearer <token>` mit.

**So erklärst du es:** *„JWT ist wie ein Festival-Bändchen: Beim Einlass (Login) einmal geprüft und umgemacht, danach zeigt man nur noch das Bändchen vor. Der Server muss sich nichts merken — die Signatur beweist, dass das Bändchen echt ist und niemand die Rolle darauf manipuliert hat."*

**Wo:** `backend/src/auth/application/login.use-case.ts` (Login + Token-Ausstellung) · `frontend/src/app/core/auth/auth.service.ts` (Token in localStorage, Signals) · `auth.interceptor.ts` (hängt Token automatisch an jede Anfrage)

**Detail, das Eindruck macht:** Bei falscher E-Mail UND falschem Passwort kommt **dieselbe** Fehlermeldung — sonst könnte ein Angreifer ausprobieren, welche E-Mails existieren.

## 2. Autorisierung — Guards & Rollen 🧑‍💻 (Phase 2)

**Was:** Zwei Türsteher im Backend: `JwtAuthGuard` prüft *„wer bist du?"* (gültiges Token? sonst **401**), dein **`RolesGuard`** prüft *„darfst du das?"* (steht deine Rolle auf der Gästeliste des Endpoints? sonst **403**). Endpoints markiert man mit `@Roles(Role.Admin)` — das sind nur Metadaten, der Guard liest sie per `Reflector` und vergleicht mit `includes()`.

**So erklärst du es:** *„Authentifizierung und Autorisierung sind zwei verschiedene Fragen mit zwei verschiedenen Statuscodes: 401 heißt ‚ich kenne dich nicht', 403 heißt ‚ich kenne dich, aber du darfst das nicht'. Ich habe das als globale Guards gebaut — standardmäßig ist ALLES geschützt, öffentliche Endpoints brauchen explizit @Public(). Fail-safe statt fail-open."*

**Wo:** `backend/src/shared/guards/roles.guard.ts` 🧑‍💻 · `jwt-auth.guard.ts` · Frontend-Pendant: `frontend/src/app/core/auth/auth.guard.ts` 🧑‍💻 (leitet Nicht-Eingeloggte nach `/login` um — per `UrlTree`)

**Detail, das Eindruck macht:** *„Der Frontend-Guard ist nur Komfort — die echte Sicherheit ist im Backend. Frontend-Code kann jeder im Browser aushebeln."*

## 3. Domain-Driven Design — die Backend-Architektur

**Was:** Jeder Fachbereich („Bounded Context": `auth`, `users`, `requests`, `events`) ist ein eigenes Modul mit drei Schichten: **domain/** (Geschäftslogik, pures TypeScript, kein Framework-Import!), **application/** (Use-Cases + Controller), **infrastructure/** (TypeORM-Datenbankzugriff).

**So erklärst du es:** *„Die Geschäftsregeln — z.B. ‚nur eigene Entwürfe darf man bearbeiten' — leben in der Domain-Schicht als reine TypeScript-Klassen, ohne einen einzigen Framework-Import. Datenbank und HTTP sind austauschbare Details außen herum. Verbunden wird das über das Repository-Pattern: Die Domain definiert ein Interface, die Infrastruktur liefert die TypeORM-Implementierung, NestJS stöpselt sie per Dependency Injection zusammen."*

**Wo:** `backend/src/requests/` ist das beste Beispiel — `domain/entities/request.ts` vs. `infrastructure/repositories/typeorm-request.repository.ts`

**Beweis-Satz:** *„Man kann es greppen: In keinem domain/-Ordner gibt es einen @nestjs- oder typeorm-Import."*

## 4. Die Status-Maschine 🧑‍💻 (Phase 4)

**Was:** Ein Antrag durchläuft `draft → submitted → in_review → approved/rejected/changes_requested` (und von changes_requested zurück zu submitted). Welche Übergänge erlaubt sind, steht in **einer Tabelle** (`TRANSITIONS`); die Methode `transitionTo` schlägt nach und wirft bei verbotenen Sprüngen einen Fehler → HTTP 422.

**So erklärst du es:** *„Die Übergangsregeln sind Daten, kein if-else-Wald: eine Map von ‚aktueller Status' auf ‚erlaubte Ziele'. Eine neue Regel ist eine neue Zeile in der Tabelle. Und das sitzt in der Domain-Entity selbst — egal ob der Aufruf über REST, WebSocket oder einen Test kommt, niemand kann einen abgelehnten Antrag wieder genehmigen."*

**Wo:** `backend/src/requests/domain/entities/request.ts` (TRANSITIONS + transitionTo) 🧑‍💻

**Dazu gehört:** der **Audit-Trail** — jede Statusänderung wird append-only in `request_events` protokolliert (wer, was, wann, von→nach, Kommentar). Das Repository hat absichtlich kein update/delete.

## 5. Angular Signals & computed (Phase 3+5)

**Was:** Signals sind reaktive Werte („Zellen"), `computed()` sind Formeln darüber — wie Excel: Ändert sich eine Zelle, rechnen alle abhängigen Formeln automatisch neu, und Angular aktualisiert genau die betroffenen Stellen im DOM.

**So erklärst du es:** *„Das Board ist ein computed: Es verteilt die gefilterte Antragsliste auf vier Spalten. Als ich später WebSocket-Updates einbaute, musste ich am Board nichts ändern — das Event lädt die Liste neu, und die Formel-Kette Liste → Filter → Spalten rechnet von selbst durch. Deklarativ statt manuell nachziehen."*

**Wo:** `frontend/src/app/features/requests/request-list.ts` (`filtered`, `boardColumns`)

## 6. Echtzeit — WebSocket + Domain-Events (Phase 5)

**Was:** Bei jedem Statuswechsel feuert das Backend intern ein **Domain-Event** (`request.status-changed`, via EventEmitter2). Ein **WebSocket-Gateway** (socket.io) lauscht darauf und pusht es an die verbundenen Browser — aber nur an die richtigen: Verbindung nur mit gültigem JWT, Requester landen in einem privaten Raum (`user:<id>`), Reviewer im `reviewers`-Raum. Ein Event geht nur an Reviewer + den Antrags-Besitzer.

**So erklärst du es:** *„Der Review-Code weiß nichts vom WebSocket — er feuert nur ein Event. Das Gateway ist ein unabhängiger Abonnent. So konnte ich Echtzeit nachrüsten, ohne eine Zeile Geschäftslogik anzufassen. Und die Sichtbarkeitsregeln der REST-API gelten im Socket weiter, über Räume."*

**Wo:** `backend/src/events/requests.gateway.ts` · Frontend: `core/realtime/realtime.service.ts`

## 7. Deployment (Docker)

**Was:** Multi-Stage-Dockerfiles (Build-Container kompiliert, Runtime-Container bleibt schlank), Frontend wird von nginx ausgeliefert (mit `/api`-Proxy ans Backend), PostgreSQL läuft ohne offenen Port nur im Container-Netz, Secrets in einer git-ignorierten `.env`, Migrationen laufen automatisch beim Container-Start.

**So erklärst du es:** *„Ein Befehl baut und startet den kompletten Stack. Die Datenbank ist von außen gar nicht erreichbar, nur das nginx-Frontend exponiert einen Port — Prinzip der minimalen Angriffsfläche."*

**Wo:** `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.prod.yml`

---

## Wenn nur EINE Frage kommt: „Was war die interessanteste Herausforderung?"

> „Die Status-Maschine sauber durchzuziehen — vom Domain-Modell über erzwungene Übergänge bis zur Live-Aktualisierung im Browser. Und zu lernen, dass Sicherheit in Schichten kommt: Frontend-Validierung für die UX, Backend-Validierung als Wahrheit, Guards für Zugriff, und ehrliche Fehlermeldungen, damit man 401 von einem Serverausfall unterscheiden kann."
