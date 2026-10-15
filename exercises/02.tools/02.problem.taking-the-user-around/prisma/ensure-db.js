// Runs before `npm run dev`. The first time an app starts, it creates `.env`
// from `.env.example` and creates and seeds `prisma/data.db`. After that, it
// does nothing, so your data stays.
import { execSync } from 'node:child_process'
import console from 'node:console'
import fs from 'node:fs'
import process from 'node:process'
import { DatabaseSync } from 'node:sqlite'

const dbPath = 'prisma/data.db'

if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
	fs.copyFileSync('.env.example', '.env')
	console.log('📝 created .env from .env.example')
}

// The app creates an empty `data.db` when it starts without a database, so
// check for a table, not only for the file.
function hasTables() {
	if (!fs.existsSync(dbPath)) return false
	const db = new DatabaseSync(dbPath, { readOnly: true })
	try {
		const table = db
			.prepare(
				"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Category'",
			)
			.get()
		return Boolean(table)
	} finally {
		db.close()
	}
}

if (!hasTables()) {
	console.log('🗄  creating and seeding the database (first run only)...')
	try {
		// The Prisma CLI reads a SQLite path relative to `prisma/schema.prisma`.
		execSync('npx prisma migrate deploy', {
			stdio: 'inherit',
			env: { ...process.env, DATABASE_URL: 'file:./data.db' },
		})
		// The app and the seed read the path relative to the app folder.
		execSync('npx tsx prisma/seed.ts', {
			stdio: 'inherit',
			env: { ...process.env, DATABASE_URL: 'file:./prisma/data.db' },
		})
	} catch (error) {
		// Remove a half-made database so that the next start tries again.
		fs.rmSync(dbPath, { force: true })
		throw error
	}
}
