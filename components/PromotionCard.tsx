import Link from 'next/link'

interface PromotionCardProps {
  title: string
  buttonText: string
  href: string
}

export default function PromotionCard({ title, buttonText, href }: PromotionCardProps) {
  return (
    <div className="bg-yellow-gradient rounded-2xl p-5 text-gray-800 shadow-yellow">
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <Link
        href={href}
        className="inline-block bg-white text-yellow-600 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition shadow-sm"
      >
        {buttonText}
      </Link>
    </div>
  )
}