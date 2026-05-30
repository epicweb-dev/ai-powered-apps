import path from 'node:path'
import { type PrismaConfig } from 'prisma'

// Import environment variables
import 'dotenv/config'

export default {
	schema: path.join('prisma', 'schema.prisma'),
	migrations: {
		path: path.join('prisma', 'migrations'),
		seed: 'npm run db:seed',
	},
} satisfies PrismaConfig
