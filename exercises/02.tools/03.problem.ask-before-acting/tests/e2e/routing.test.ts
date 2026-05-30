import test, { expect } from '@playwright/test'

test.describe('Routing E2E Tests', () => {
	test('should navigate to home page and render correct content', async ({
		page,
	}) => {
		await page.goto('/')
		await expect(page.getByRole('heading', { name: 'Step Into' })).toBeVisible()
	})

	test('should navigate to about page and render correct content', async ({
		page,
	}) => {
		await page.goto('/about')
		await expect(page.getByRole('heading', { name: 'Our Story' })).toBeVisible()
	})

	test('should navigate to contact page and render correct content', async ({
		page,
	}) => {
		await page.goto('/contact')
		await expect(
			page.getByRole('heading', { name: 'Get in Touch' }),
		).toBeVisible()
	})

	test('should navigate to products page and render correct content', async ({
		page,
	}) => {
		await page.goto('/products')
		await expect(
			page.getByRole('heading', { name: 'All Products' }),
		).toBeVisible()
	})

	test('should navigate to terms-of-service page and render correct content', async ({
		page,
	}) => {
		await page.goto('/terms-of-service')
		await expect(
			page.getByRole('heading', { name: 'Terms of Service' }),
		).toBeVisible()
	})

	test('should navigate to terms-of-use page and render correct content', async ({
		page,
	}) => {
		await page.goto('/terms-of-use')
		await expect(
			page.getByRole('heading', { name: 'Terms of Use' }),
		).toBeVisible()
	})
})
