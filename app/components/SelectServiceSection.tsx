import { Wrench, Fan, Tv, Refrigerator, Smartphone, Laptop } from 'lucide-react';

export default function SelectServiceSection() {
  const services = [
    { name: 'AC Repair', icon: <Wrench size={22} className="text-primary-yellow" />, bgColor: 'bg-blue-50' },
    { name: 'Fan', icon: <Fan size={22} className="text-primary-yellow" />, bgColor: 'bg-purple-50' },
    { name: 'Smart TV', icon: <Tv size={22} className="text-primary-yellow" />, bgColor: 'bg-pink-50' },
    { name: 'Fridge', icon: <Refrigerator size={22} className="text-primary-yellow" />, bgColor: 'bg-cyan-50' },
    { name: 'Mobile', icon: <Smartphone size={22} className="text-primary-yellow" />, bgColor: 'bg-green-50' },
    { name: 'Laptop', icon: <Laptop size={22} className="text-primary-yellow" />, bgColor: 'bg-amber-50' },
  ];

  return (
    <section className="px-4 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-primary-text">Select Service</h2>
        <button className="text-sm font-medium text-primary-yellow hover:text-primary-yellow-dark transition-colors">
          See all
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-3 gap-4">
        {services.map((service, index) => (
          <button
            key={index}
            className="bg-white-surface rounded-xl p-4 flex flex-col items-center shadow-soft hover:shadow-medium active:scale-[0.95] transition-all"
          >
            <div className={`w-14 h-14 ${service.bgColor} rounded-full flex items-center justify-center mb-3`}>
              {service.icon}
            </div>
            <span className="text-sm font-medium text-primary-text text-center leading-tight">
              {service.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}