import { MapPin, Calendar, Clock, User, CheckCircle } from 'lucide-react'

interface BookingCardProps {
  booking: {
    id: string
    service: string
    date: string
    time?: string
    technician?: string
    status: 'active' | 'completed' | 'cancelled' | 'upcoming'
    address?: string
    price?: string
    rating?: number
  }
}

export default function BookingCard({ booking }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-600'
      case 'completed': return 'bg-green-100 text-green-600'
      case 'cancelled': return 'bg-red-100 text-red-600'
      case 'upcoming': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 mr-1" />
      default: return null
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
          <h3 className="font-semibold text-lg">{booking.service}</h3>
          <p className="text-gray-600 text-sm">Booking #{booking.id}</p>
        </div>
        {booking.price && (
          <div className="text-right">
            <div className="text-xl font-bold">{booking.price}</div>
            {booking.rating && (
              <div className="flex items-center justify-end text-yellow-500 text-sm">
                ⭐ {booking.rating}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{booking.date}</span>
        </div>
        {booking.time && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{booking.time}</span>
          </div>
        )}
        {booking.technician && (
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm">{booking.technician}</span>
          </div>
        )}
        {booking.address && (
          <div className="flex items-start text-gray-600">
            <MapPin className="h-4 w-4 mr-2 mt-0.5" />
            <span className="text-sm">{booking.address}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-3 border-t">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
          View Details
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          {booking.status === 'completed' ? 'Rate Service' : 'Track Order'}
        </button>
      </div>
    </div>
  )
}