// Runs BEFORE epicshop copies an exercise over the playground.
// epicshop deletes any playground file not present in the source exercise, which
// nukes the student's .env (API key) and prisma/data.db (their database) on every
// move. We stash them here and restore them in post-set-playground.js so they
// persist across the whole workshop.
import fs from 'node:fs'
import path from 'node:path'

const playgroundDir = process.env.EPICSHOP_PLAYGROUND_DEST_DIR
if (playgroundDir) {
	const stashDir = path.join(process.cwd(), 'epicshop', '.playground-data')
	fs.mkdirSync(stashDir, { recursive: true })
	// [source in playground, stashed filename]
	const files = [
		['.env', '.env'],
		[path.join('prisma', 'data.db'), 'data.db'],
	]
	for (const [rel, stashName] of files) {
		const src = path.join(playgroundDir, rel)
		if (fs.existsSync(src)) {
			fs.copyFileSync(src, path.join(stashDir, stashName))
		}
	}
}
