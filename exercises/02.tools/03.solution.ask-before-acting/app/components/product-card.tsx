import { Heart, Star } from 'lucide-react'
import { Link } from 'react-router'
import { type ProductCardInfo } from '#app/domain/products.server.js'

export function ProductCard({ product }: { product: ProductCardInfo }) {
	return (
		<div
			key={product.id}
			className="group overflow-hidden rounded-lg bg-white transition-all duration-300 hover:scale-105 hover:transform hover:shadow-xl dark:bg-gray-800"
		>
			<div className="relative overflow-hidden">
				<Link to={`/products/${product.id}`}>
					<img
						src={product.imageUrl}
						alt={product.name}
						className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				</Link>
				<button className="absolute top-4 right-4 rounded-full bg-white p-2 shadow-lg transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
					<Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
				</button>
				<div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 dark:bg-gray-900">
					<div className="flex items-center space-x-1">
						<Star className="h-4 w-4 fill-current text-amber-500" />
						<span className="text-sm font-medium text-gray-900 dark:text-white">
							{product.reviewScore.toFixed(1)}
						</span>
					</div>
				</div>
			</div>
			<div className="p-6">
				<div className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-500">
					{product.brand.name}
				</div>
				<Link to={`/products/${product.id}`}>
					<h3 className="mb-2 text-lg font-medium text-gray-900 transition-colors duration-300 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-500">
						{product.name}
					</h3>
				</Link>
				<p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
					{product.description}
				</p>
				<div className="flex items-center justify-between">
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						${product.price}
					</span>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						{product._count.reviews} reviews
					</span>
				</div>
			</div>
		</div>
	)
}
