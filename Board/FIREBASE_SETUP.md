Project goal (one sentence)
Set up a Firebase Realtime Database for a GitHub-hosted live drawing board that stores user identities, realtime drawing strokes, bans/suspensions, admin action logs, and appeal submissions. The database must support realtime updates for all connected users, allow admins to moderate, and be reasonably secure for production.

What the database will contain (top-level structure)

We will use one Realtime Database with these top-level nodes (JSON keys):

- /users/{userId} — per-user metadata (firstSeen, lastSeen, optional display name, banned/suspended flags).

- /strokes/{strokeId} — each stroke object with userId, color, size, points (array of {x,y} or packed arrays), and timestamp. Each stroke is append-only (soft-delete via flag).

- /bans/{userId} — ban or suspend entries with type, until (ISO string or "permanent"), reason, adminId, timestamp. If an entry exists and is active, the frontend must block drawing.

- /adminLogs/{logId} — audit trail of admin actions (action, adminId, target, reason, timestamp).

- /appeals/{appealId} — user appeal submissions (userId, message, timestamp).

- /admins/{uid} — map of admin UIDs (used by security rules when enforcing admin-only writes).

Design note: strokes are stored as separate children under /strokes so clients can onChildAdded and render new strokes instantly. User/ban/admin nodes exist for management and checks.

Step-by-step setup instructions (for the executor)

1) Create Firebase project and Realtime Database

Open https://console.firebase.google.com, create a project (name: RAM-Backend-RealArtMaine or similar).

In your project, click Realtime Database → Create database. Choose your region and Start in test mode (we will lock down later). This creates the empty database (root shows null).

Why: Test mode lets the front-end read and write freely while you develop and verify realtime flows. We will apply production rules later.

2) Add a Web app and copy the config snippet

In the Firebase console, click the Web icon </> to Add app and register a Web app name (e.g., FreeDrawBoard).

Copy the firebaseConfig object (apiKey, authDomain, databaseURL, projectId, etc.). You will paste this into the site HTML before your board scripts.

Why: This snippet initializes Firebase for the website so the front-end can talk to Realtime Database.

3) Basic rules for development (paste into Rules tab)

While developing, paste this minimal rule set so you can test immediately:

{
  "rules": {
    ".read": true,
    ".write": true
  }
}

Why: Easiest for development. Do not leave this in place for production.

4) Add a small, validated ruleset for production

When ready to secure the DB, replace the test rules with the following. This enforces basic validation on strokes, prevents deletes by clients, and restricts admin paths to authenticated admins (requires Firebase Authentication for admins).

Production rules (drop into Rules editor when you’re ready):

{
  "rules": {
    "strokes": {
      // Allow anyone to read strokes.
      ".read": true,
      // Allow writes if the new data validates as a stroke object.
      ".write": "newData.exists() && newData.hasChildren(['userId', 'points', 'color', 'size', 'timestamp'])",
      "$strokeId": {
        ".validate": "newData.child('userId').isString() &&
                      newData.child('points').isArray() &&
                      newData.child('color').isString() &&
                      newData.child('size').isNumber() &&
                      newData.child('timestamp').isNumber() &&
                      // Prevent clients from deleting existing strokes (only new writes)
                      (!data.exists() || newData.exists())"
      }
    },
    "users": {
      ".read": true,
      ".write": true
    },
    "bans": {
      ".read": true,
      // Only admins can write bans; admin UIDs are stored under /admins
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    },
    "adminLogs": {
      ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    },
    "appeals": {
      ".read": false,
      ".write": true  // users can submit appeals
    },
    "admins": {
      ".read": false,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()" 
    }
  }
}

Important notes about these rules:

- They assume admins will authenticate using Firebase Auth (email/password or other). You will create admin accounts and store their uid under /admins/{uid}: true.

- Strokes are validated for required fields and are append-only (clients cannot delete existing strokes).

- adminLogs and bans require authenticated admin writes.

5) Create an admin account (for production security)

In Firebase console → Authentication → Add user (email/password). Create an account for the site owner (your email).

Note the newly created user’s UID (you can find it in the users list).

In Realtime Database (Data tab) add /admins/{UID} = true manually (or use admin SDK). This allows that UID to perform admin actions under the rules above.

Why: Admin writes must be trusted. Using Firebase Auth ensures only the listed admin UIDs can write bans and logs.

6) Frontend implementation checklist (what the website must do)

- Initialize Firebase: paste the firebaseConfig from step 2 in <script type="module"> and call initializeApp() and getDatabase().

- User ID generation: on first visit, create localStorage.boardUserId = crypto.randomUUID(); and store in window.CURRENT_USER_ID. This ID is used as userId on every stroke.

- Save stroke (on pointer up):
  - Create stroke = { userId, color, size, points, timestamp: Date.now() }.
  - push(ref(database,'strokes'), stroke).
  - Optionally write a lightweight local cache of stroke keys for possible later deletion/soft-delete by admin.

- Render new strokes in realtime:
  - onChildAdded(ref(database,'strokes'), snapshot => drawStroke(snapshot.val()));
  - The drawStroke() function replays points onto canvas using color and size.

- Ban check before enabling drawing:
  - On load, query get(ref(database, 'bans/' + userId)) or once('value') and block drawing if a ban entry exists and is active (check until).
  - Also listen for onValue subscription on bans/{userId} to react to admin changes in real time (suspend/unban).

- Appeal form: user submits push(ref(database,'appeals'), { userId, message, timestamp }) and sends an EmailJS notification to admin if desired.

- Admin panel: require admin to sign in (Firebase Auth). Admin listens to strokes and can:
  - Write /bans/{userId} to ban.
  - Write /adminLogs/{logId} recording actions.
  - Soft-delete strokes by writing a deleted:true flag under their stroke object (prefer to avoid client deletion).

Why: These steps make the overall system realtime, auditable, and manageable while keeping the heavy lifting client-side and admin-protected.

7) Data format suggestions (compact & practical)

- stroke.points should be an array of small {x,y} objects (use integers relative to canvas size) or packed arrays like [[x,y],[x,y],...]. Packed arrays save bandwidth.

- color as hex string ("#000000").

- size as small integer.

- timestamp as Date.now() (ms since epoch) — easy to sort and compare.

8) Housekeeping, limits, and backups

- Firebase Spark plan has free quotas. Monitor usage in the Firebase console. If you expect heavy usage, implement limits like thinning strokes (sample points) or pruning old strokes.

- Provide a periodic export (manually via console or automated Cloud Function) to back up strokes to Cloud Storage or your local machine.

- Consider grouping strokes into per-session nodes if you want paged loading (e.g., /sessions/{sessionId}/strokes/...) to avoid huge flat lists.

9) Security reminders (do not expose keys)

- The firebaseConfig (apiKey, etc.) is safe to include in client code for public web apps — it is not a secret by itself. Do not put server service-account keys in client code.

- Restrict admin capabilities via Firebase Auth + rules as shown.

- Do not leave the database rules as ".read": true, ".write": true in production.
