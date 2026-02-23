interface ServiceCategoryProps {
  category: {
    name: string
    icon: string
    count?: number
  }
}

export default function ServiceCategory({ category }: ServiceCategoryProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{category.icon}</div>
      <div className="font-semibold text-gray-800">{category.name}</div>
      {category.count !== undefined && (
        <div className="text-xs text-gray-500 mt-1">
          {category.count} services
        </div>
      )}
    </div>
  )
}