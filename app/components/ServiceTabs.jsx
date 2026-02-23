export default function ServiceTabs() {
  return (
    <div className="px-4 mb-4">
      <div className="flex bg-white-surface rounded-full p-1 shadow-soft">
        <button className="flex-1 py-2.5 bg-primary-yellow text-primary-text font-semibold rounded-full text-sm transition-colors">
          Service
        </button>
        <button className="flex-1 py-2.5 text-secondary-text font-medium rounded-full text-sm hover:text-primary-text transition-colors">
          Shopping
        </button>
        <button className="flex-1 py-2.5 text-secondary-text font-medium rounded-full text-sm hover:text-primary-text transition-colors">
          Resell
        </button>
      </div>
    </div>
  );
}