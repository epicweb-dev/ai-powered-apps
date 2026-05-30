import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './generated/prisma/client'

const adapter = new PrismaBetterSQLite3({
	url: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })
await prisma.$connect()
export const db = prisma
