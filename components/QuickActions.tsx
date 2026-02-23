import { Wrench, ShoppingBag, Repeat, Home } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { icon: Wrench, label: 'Service', color: 'bg-yellow-100 text-yellow-600' },
    { icon: ShoppingBag, label: 'Shopping', color: 'bg-blue-50 text-blue-600' },
    { icon: Repeat, label: 'Resell', color: 'bg-purple-50 text-purple-600' },
    { icon: Home, label: 'Rental', color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button key={action.label} className="text-center">
            <div className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm`}>
              <Icon className="h-7 w-7" />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}