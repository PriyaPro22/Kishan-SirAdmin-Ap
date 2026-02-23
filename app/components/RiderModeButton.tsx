export default function RiderModeButton() {
  return (
    <div className="px-4 mb-4">
      <button className="w-full bg-primary-yellow text-primary-text rounded-full py-3.5 flex items-center justify-center gap-2 font-semibold text-base shadow-soft hover:bg-primary-yellow-dark transition-colors active:scale-[0.98]">
        <img
          src="/icons/rider-motorcycle.png"
          alt="Rider Mode"
          className="w-10 h-10 object-contain -ml-2"
        />
        RIDER MODE
      </button>
    </div>
  );
}