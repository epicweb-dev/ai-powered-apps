import test, { expect } from '@playwright/test'

test.describe('Routing E2E Tests', () => {
	test('should navigate to home page and render correct content', async ({
		page,
	}) => {
		await page.goto('/')
		const stylesheets = await page.locator('link[rel="stylesheet"]').all()
		expect(stylesheets.length).toBeGreaterThan(0)
		const stylesheetValues = await Promise.all(
			stylesheets.map(async (link) => {
				const href = await link.getAttribute('href')
				return href
			}),
		)
		const requiredStylesheets = [
			'/app/app.css',
			'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
		]
		requiredStylesheets.forEach((requiredStylesheet) => {
			expect(stylesheetValues).toContain(requiredStylesheet)
		})
	})
})
