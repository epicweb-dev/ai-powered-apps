// Runs before `npm run dev`. The first time an app starts, it creates `.env`
// from `.env.example` and creates and seeds `prisma/data.db`. After that, it
// does nothing, so your data stays.
import { execSync } from 'node:child_process'
import console from 'node:console'
import fs from 'node:fs'
import process from 'node:process'

if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
	fs.copyFileSync('.env.example', '.env')
	console.log('📝 created .env from .env.example')
}

if (!fs.existsSync('prisma/data.db')) {
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
		fs.rmSync('prisma/data.db', { force: true })
		throw error
	}
}
