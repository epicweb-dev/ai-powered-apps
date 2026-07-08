// Runs AFTER epicshop copies an exercise over the playground. Restores the .env
// and prisma/data.db that pre-set-playground.js stashed, so the student's API key
// and database survive every move between exercises.
import fs from 'node:fs'
import path from 'node:path'

const playgroundDir = process.env.EPICSHOP_PLAYGROUND_DEST_DIR
if (playgroundDir) {
	const stashDir = path.join(process.cwd(), 'epicshop', '.playground-data')
	// [stashed filename, destination in playground]
	const files = [
		['.env', '.env'],
		['data.db', path.join('prisma', 'data.db')],
	]
	for (const [stashName, destRel] of files) {
		const stashed = path.join(stashDir, stashName)
		const dest = path.join(playgroundDir, destRel)
		if (fs.existsSync(stashed)) {
			fs.mkdirSync(path.dirname(dest), { recursive: true })
			fs.copyFileSync(stashed, dest)
		}
	}

	// First exercise (nothing stashed yet): seed .env from the .env.example that
	// ships with every exercise, so the app boots out of the box (DATABASE_URL is
	// set). The chat stays inert until the student pastes their OPENROUTER_API_KEY.
	// Never overwrite an existing .env — the stash/restore above keeps the key.
	const env = path.join(playgroundDir, '.env')
	const envExample = path.join(playgroundDir, '.env.example')
	if (!fs.existsSync(env) && fs.existsSync(envExample)) {
		fs.copyFileSync(envExample, env)
		console.log('📝 created playground .env from .env.example')
	}
}
