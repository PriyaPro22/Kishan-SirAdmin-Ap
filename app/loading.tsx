export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
                {/* Logo Container */}
                <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center p-4 mb-4 animate-pulse">
                    <img
                        src="/logo.png"
                        alt="Loading..."
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Loading Spinner */}
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
}
