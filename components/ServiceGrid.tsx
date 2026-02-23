import { Snowflake, Tv, Wind, Home, Smartphone, Laptop } from 'lucide-react'

export default function ServiceGrid() {
  const services = [
    { icon: Snowflake, label: 'AC Repair', color: 'bg-yellow-100 border-yellow-200' },
    { icon: Wind, label: 'Fan', color: 'bg-blue-50 border-blue-200' },
    { icon: Tv, label: 'Smart TV', color: 'bg-purple-50 border-purple-200' },
    { icon: Home, label: 'Fridge', color: 'bg-cyan-50 border-cyan-200' },
    { icon: Smartphone, label: 'Mobile', color: 'bg-pink-50 border-pink-200' },
    { icon: Laptop, label: 'Laptop', color: 'bg-orange-50 border-orange-200' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {services.map((service) => {
        const Icon = service.icon
        return (
          <button key={service.label} className="text-center group">
            <div className={`${service.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-2 border shadow-sm group-hover:shadow-yellow transition-shadow`}>
              <Icon className="h-10 w-10 text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-700">{service.label}</span>
          </button>
        )
      })}
    </div>
  )
}