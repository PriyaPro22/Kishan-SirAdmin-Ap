'use client';

import { ArrowLeft, CheckCircle, ShieldCheck, Download, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function RateCardPage() {
    const router = useRouter();
    const { darkMode } = useApp();

    const rates = [
        { service: 'AC General Service', price: '₹599', type: 'Fixed' },
        { service: 'AC Foam Jet Service', price: '₹899', type: 'Fixed' },
        { service: 'AC Gas Charging (<1.5 Ton)', price: '₹2500', type: 'Variable' },
        { service: 'AC Gas Charging (>1.5 Ton)', price: '₹2900', type: 'Variable' },
        { service: 'AC Installation', price: '₹1499', type: 'Fixed' },
        { service: 'AC Uninstallation', price: '₹799', type: 'Fixed' },
        { service: 'Fan Repair', price: '₹149', type: 'Visit Charge' },
        { service: 'Switchboard Repair', price: '₹99', type: 'Per Unit' },
        { service: 'MCB Replacement', price: '₹249', type: 'Fixed' },
        { service: 'House Wiring Check', price: '₹349', type: 'Inspection' },
    ];

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} pb-10 transition-colors duration-300`}>
            {/* Header */}
            <header className={`sticky top-0 z-40 px-4 py-4 shadow-sm ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Standard Rate Card</h1>
                </div>
            </header>

            {/* Info Banner */}
            <div className="p-4">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg mb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg mb-1">Transparent Pricing</h2>
                            <p className="text-sm opacity-90">
                                All prices are standard and inclusive of taxes. No hidden charges.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={`flex items-center px-4 py-3 rounded-xl mb-6 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Search size={20} className="text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className={`bg-transparent w-full outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                    />
                </div>

                {/* Rate Table */}
                <div className={`rounded-xl overflow-hidden shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                                <tr>
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider opacity-70">Service Name</th>
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider opacity-70 text-right">Standard Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {rates.map((item, index) => (
                                    <tr key={index} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                                        <td className="px-5 py-4 text-sm font-medium">
                                            <div>{item.service}</div>
                                            <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.type}</div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-bold text-right">
                                            {item.price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 flex flex-col items-center text-center gap-2">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        * Final prices might vary slightly based on inspection.
                    </p>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-50'}`}>
                        <Download size={16} />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
