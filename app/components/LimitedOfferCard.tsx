export default function LimitedOfferCard() {
  return (
    <div className="px-4 mb-6">
      <div className="bg-dark-offer rounded-2xl p-5 shadow-medium overflow-hidden">
        {/* Badge */}
        <div className="inline-flex items-center gap-1 px-3 py-1 border border-primary-yellow/30 rounded-full mb-3">
          <span className="text-xs font-semibold text-white">LIMITED OFFER</span>
        </div>
        
        {/* Content */}
        <h2 className="text-white text-xl font-bold mb-4 leading-tight">
          Get 20% off on your first AC Service
        </h2>
        
        {/* Button */}
        <button className="w-full bg-primary-yellow text-primary-text font-bold py-3 rounded-xl hover:bg-primary-yellow-dark transition-colors active:scale-[0.98] shadow-md">
          Book Now
        </button>
      </div>
    </div>
  );
}