import { Star } from 'lucide-react'
import Link from 'next/link'

interface ServiceCardProps {
  service: {
    id: number
    title: string
    brand?: string
    rating: number
    reviews: string
    features?: string[]
    description?: string
    originalPrice?: number
    discountedPrice?: number
    price?: number
    discount?: string
    note?: string
    buttonText?: string
    badge?: string
  }
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-yellow border border-yellow-100 hover:shadow-yellow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          {service.badge && (
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded mb-2 border border-yellow-200">
              {service.badge}
            </span>
          )}
          <h3 className="font-semibold text-lg text-gray-800">{service.title}</h3>
          {service.brand && (
            <div className="text-sm text-gray-600 mt-1">{service.brand}</div>
          )}
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="ml-1 font-medium text-gray-700">{service.rating}</span>
          <span className="ml-1 text-gray-600 text-sm">{service.reviews}</span>
        </div>
      </div>

      {/* Features/Description */}
      {service.features ? (
        <ul className="space-y-2 mb-4">
          {service.features.map((feature, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="mr-2 text-yellow-500">•</span>
              {feature}
            </li>
          ))}
        </ul>
      ) : service.description && (
        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
      )}

      {/* Price */}
      <div className="flex justify-between items-center">
        <div>
          {service.discountedPrice ? (
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-gray-800">₹{service.discountedPrice}</div>
              <div className="text-gray-500 line-through">₹{service.originalPrice}</div>
              {service.discount && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded border border-green-200">
                  {service.discount}
                </span>
              )}
            </div>
          ) : service.price && (
            <div className="text-xl font-bold text-gray-800">₹{service.price}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">Inclusive of all taxes</div>
        </div>
        
        <Link
          href={`/services/${service.id}`}
          className="px-6 py-2 bg-yellow-gradient text-gray-800 rounded-lg font-semibold hover:opacity-90 transition shadow-sm"
        >
          {service.buttonText || 'View details'}
          <span className="ml-1">&gt;</span>
        </Link>
      </div>
    </div>
  )
}