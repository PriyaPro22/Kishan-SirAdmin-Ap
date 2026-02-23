import React from 'react';
import { Star, AlertCircle, Tag, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import clockAnim from '../../public/animations/clock.json';
import warrantyAnim from '../../public/animations/safe-done.json';

interface ServiceDetailCardProps {
  firstTitle: string;
  secondTitle?: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  warranty?: string;
  minTime?: number;
  maxTime?: number;
  originalPrice?: number;
  currentPrice?: number;
  discountType?: string;
  discountValue?: number;
  gst?: number;
  gstType?: string;
  onViewDetails?: () => void;
  onBook?: () => void;
  darkMode?: boolean;
  isNew?: boolean;
  badge?: string;
}

export const ServiceDetailCard: React.FC<ServiceDetailCardProps> = ({
  firstTitle,
  secondTitle,
  description,
  rating,
  ratingCount,
  warranty,
  minTime,
  maxTime,
  originalPrice,
  currentPrice,
  discountType,
  discountValue,
  gst,
  gstType,
  onViewDetails,
  onBook,
  darkMode = false,
  isNew = false,
  badge,
}) => {
  const calculateDiscount = () => {
    if (!originalPrice || !currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const discountPercent = calculateDiscount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden border transition-all ${darkMode
        ? 'bg-[#1F2937] border-gray-700 shadow-lg shadow-black/30'
        : 'bg-white border-gray-100 shadow-md'
        }`}
    >
      {/* Header with Badge */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
          }`}
      >
        <div className="flex gap-2">
          {isNew && (
            <span className="px-2 py-1 bg-yellow-400 text-gray-900 text-[10px] font-bold rounded-md">
              NEW
            </span>
          )}
          {badge && (
            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${badge === 'BESTSELLER'
              ? 'bg-red-100 text-red-700'
              : badge === 'LIMITED'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
              }`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div className="px-4 pt-4 pb-2">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {firstTitle}
        </h3>
        {secondTitle && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {secondTitle}
          </p>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="px-4 pb-4">
          <div className={`text-[12px] font-normal flex flex-col gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {(() => {
              const textVal = description.replace(/Description\s*\*\s*/, '');
              const parts = textVal.split(/([|•~])/);
              const elements: { type: 'bullet' | 'para', text: string }[] = [];

              for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part === '|' || part === '•') {
                  if (parts[i + 1]?.trim()) {
                    elements.push({ type: 'bullet', text: parts[i + 1] });
                    i++;
                  }
                } else if (part === '~') {
                  if (parts[i + 1]?.trim()) {
                    elements.push({ type: 'para', text: parts[i + 1] });
                    i++;
                  }
                } else if (part.trim()) {
                  elements.push({ type: 'para', text: part });
                }
              }

              return elements.map((item, index) => (
                item.type === 'bullet' ? (
                  <div key={index} className="flex items-start gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${darkMode ? 'bg-gray-400' : 'bg-gray-900'}`} />
                    <span>{item.text.trim()}</span>
                  </div>
                ) : (
                  <div key={index} className="leading-relaxed opacity-90 block pt-1 pb-1 text-justify">
                    {item.text.trim()}
                  </div>
                )
              ));
            })()}
          </div>
        </div>
      )}

      {/* Rating & Warranty Row */}
      {(rating || warranty) && (
        <div className={`px-4 py-3 flex flex-wrap gap-3 border-t border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
          {rating && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-md">
                <Star size={14} className="text-yellow-600 fill-yellow-600" />
                <span className="text-xs font-bold text-yellow-600">{rating}</span>
              </div>
              {ratingCount && (
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ratingCount.toLocaleString()} ratings
                </span>
              )}
            </div>
          )}

          {warranty && (
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[12px] font-bold transition-all shadow-sm ${darkMode
              ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-200 border border-white/10'
              : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-700 border border-blue-100/50'}`}>
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <Lottie animationData={warrantyAnim} loop={true} style={{ width: 22, height: 22 }} />
              </div>
              <span className="tracking-tight">{warranty}</span>
            </div>
          )}
        </div>
      )}

      {/* Time Estimate */}
      {(minTime || maxTime) && (
        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[12px] font-bold transition-all hover:shadow-sm ${darkMode
            ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-200 border border-white/10'
            : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-700 border border-blue-100/50'}`}>
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Lottie animationData={clockAnim} loop={true} style={{ width: 22, height: 22 }} />
            </div>
            <span className="tracking-tight">{minTime || '?'} - {maxTime || '?'} mins</span>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      {(Number(originalPrice) || Number(currentPrice)) && (
        <div className={`px-4 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50'
          }`}>
          <div className="flex flex-col gap-0.5">
            {/* Original Price - NOW AT THE TOP */}
            {originalPrice && currentPrice && Number(originalPrice) > Number(currentPrice) && (
              <span className={`text-[13px] line-through font-bold ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                ₹{Number(originalPrice).toLocaleString()}
              </span>
            )}

            {/* Current Price and Percent Off */}
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                ₹{Number(currentPrice)?.toLocaleString() || Number(originalPrice)?.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                  <TrendingDown size={14} className="text-red-600" />
                  <span className="text-xs font-bold text-red-600">{discountPercent}% off</span>
                </div>
              )}
            </div>

            {/* Discount Badge - Now Smaller and Below Price */}
            {(originalPrice && currentPrice && Number(originalPrice) > Number(currentPrice)) && (
              <div className="flex">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[#00a36c] dark:text-[#00c88a] font-black text-[9px] uppercase tracking-tighter whitespace-nowrap border shrink-0 min-w-max shadow-sm ${darkMode ? 'border-green-500/30 bg-green-500/10' : 'border-green-500/20 bg-green-50'}`}>
                  <Tag size={12} fill="currentColor" className="shrink-0" />
                  <span className="leading-none">
                    {(() => {
                      const orig = Number(originalPrice);
                      const dVal = Number(discountValue || 0);
                      const dType = discountType || 'fixed';
                      let savedAmount = 0;

                      if (dType === 'percentage' || dType === 'percentage ' || dType.trim() === 'percentage') {
                        savedAmount = orig * (dVal / 100);
                      } else {
                        savedAmount = dVal || (orig - Number(currentPrice));
                      }

                      return `₹${Math.round(savedAmount).toLocaleString()} PER `;
                    })()}{(() => {
                      const text = (firstTitle || '').toLowerCase();
                      if (text.includes('ac')) return 'AC';
                      if (text.includes('washing')) return 'Washing';
                      if (text.includes('fan')) return 'Fan';
                      if (text.includes('refrigerator') || text.includes('fridge')) return 'Fridge';
                      if (text.includes('ro') || text.includes('purifier')) return 'RO';
                      return 'SERVICE';
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* GST Info - Smallest at the bottom */}
            {gst !== undefined && (
              <div className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider opacity-60 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                <span>{gstType === 'include' ? 'Incl.' : 'Excl.'} all taxes</span>
              </div>
            )}
          </div>

          {/* Price Breakdown (Optional) - Inside the same Pricing Section container for alignment */}
          {originalPrice && currentPrice && (
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'
              } space-y-1 text-xs`}>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Original Price
                </span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  ₹{Number(originalPrice).toLocaleString()}
                </span>
              </div>
              {discountValue ? (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({discountType})</span>
                  <span>-₹{discountValue}</span>
                </div>
              ) : null}
              {gst && gstType === 'add' ? (
                <div className="flex justify-between text-blue-600">
                  <span>+ GST</span>
                  <span>₹{gst}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold border-t border-gray-200 pt-1">
                <span>Final Price</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  ₹{Number(currentPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-3 flex gap-2">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${darkMode
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-blue-600 hover:text-blue-700'
              }`}
          >
            View Details
          </button>
        )}
        {onBook && (
          <button
            onClick={onBook}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${darkMode
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900'
              }`}
          >
            Book Now
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ServiceDetailCard;
