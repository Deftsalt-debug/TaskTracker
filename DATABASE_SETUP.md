# TaskTrackr database setup

The current Node backend uses SQLite. It creates the database and tables when it
starts, so there is no separate database server or schema import to set up.

## Start with the default database

From the project folder:

```bash
cd nodejs-backend
npm install
npm start
```

The file is `nodejs-backend/database/tasktrackr.db`. The schema lives in
`config/database.js` and creates four tables: `users`, `tasks`,
`pomodoro_sessions` and `user_preferences`.

The SQL files in the root `database/` folder are kept from the earlier setup. They
are not imported by the current backend. The old MySQL/phpMyAdmin instructions
were for that setup, not this one.

## Use another database file

`DB_PATH` can select a different file. Its parent folder must already exist. For
example, from `nodejs-backend/` on macOS or Linux:

```bash
DB_PATH=./database/tasktrackr-dev.db npm start
```

In Windows PowerShell:

```powershell
$env:DB_PATH = './database/tasktrackr-dev.db'
npm start
```

Tests set `DB_PATH` to `:memory:` and use temporary, in-memory databases. Running
`npm test` does not overwrite your saved tasks.

## Back up your data

Stop the backend normally, then copy `tasktrackr.db` somewhere safe. Keep the copy
before replacing or deleting a database file: it contains the users, tasks and
session history. To restore it, stop the backend again and put the saved copy back
at the same path.

## Check that it works

Start the frontend in another terminal with `cd frontend`, `npm ci` and `npm start`
from the project folder. Open [localhost:3000](http://localhost:3000), register and
create a task. Reload the page to check persistence, then try a timer session and
look at History.

The API base is [localhost:8080/api](http://localhost:8080/api). You can check the
backend without logging in at [localhost:8080/health](http://localhost:8080/health).

If the database can't be opened, check that the selected directory exists and is
writable. If dependency installation fails, see [PREREQUISITES.md](PREREQUISITES.md).
