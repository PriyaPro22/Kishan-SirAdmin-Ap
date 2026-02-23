import React from 'react';
import { MediaSlider } from './MediaSlider';
import { ServiceDetailCard } from './ServiceDetailCard';
import { motion } from 'framer-motion';

interface ServicePreviewPageProps {
  service: {
    _id?: string;
    documentId?: string;
    id?: string;

    // Display Fields
    firstTitle?: string;
    secondTitle?: string;
    name?: string;
    title?: string;

    // Description & Details
    description?: string;

    // Media
    imageUri?: string;
    videos?: Array<{ videoTitle: string; url: string; visibility?: boolean }>;
    images?: Array<{ imageTitle: string; url: string; visibility?: boolean }>;
    webviewUrl?: string;

    // Pricing
    originalPrice?: number;
    currentPrice?: number;
    discountType?: string;
    discountValue?: number;
    gst?: number;
    gstType?: string;
    priceAfterGst?: number;

    // Rating & Reviews
    rating?: number;
    ratingCount?: number;
    reviews?: Array<any>;

    // Time
    minTime?: number;
    maxTime?: number;

    // Other Details
    warranty?: string;
    serviceType?: string;
    category?: string;

    // Visibility Flags
    firstTitleVisible?: boolean;
    secondTitleVisible?: boolean;
    descriptionVisible?: boolean;
    photoVisible?: boolean;
    videoVisible?: boolean;
    webviewUrlVisible?: boolean;
    originalPriceVisible?: boolean;
    currentPriceVisible?: boolean;
    minTimeVisible?: boolean;
    maxTimeVisible?: boolean;
  };
  darkMode?: boolean;
  onBook?: () => void;
  onViewFullDetails?: () => void;
  onAddToCart?: () => void;
}

export const ServicePreviewPage: React.FC<ServicePreviewPageProps> = ({
  service,
  darkMode = false,
  onBook,
  onViewFullDetails,
  onAddToCart,
}) => {
  // Build media list respecting visibility flags
  const buildMediaList = () => {
    const media: any[] = [];

    // Add videos
    if (service.videoVisible !== false && service.videos?.length) {
      media.push(
        ...service.videos
          .filter((v) => v.visibility !== false)
          .map((v) => ({
            type: 'video',
            ...v,
          }))
      );
    }

    // Add images
    if (service.photoVisible !== false && service.images?.length) {
      media.push(
        ...service.images
          .filter((i) => i.visibility !== false)
          .map((i) => ({
            type: 'image',
            ...i,
          }))
      );
    }

    // Add main image if no media
    if (media.length === 0 && service.imageUri) {
      media.push({
        type: 'image',
        url: service.imageUri,
        imageTitle: service.firstTitle || 'Service Image',
        visibility: true,
      });
    }

    return media;
  };

  const mediaList = buildMediaList();
  const displayTitle = service.firstTitle || service.name || service.title || 'Service';
  const displaySubtitle = service.secondTitle;
  const displayDescription = service.description;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      {/* Header with Navigation */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-white/80'
        }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg truncate">{displayTitle}</h1>
          <div className="flex items-center gap-2">
            {service.rating && (
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${darkMode
                ? 'bg-yellow-900/30 text-yellow-300'
                : 'bg-yellow-100 text-yellow-700'
                }`}>
                ⭐ {service.rating}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Media Section - Only show if visibility allowed */}
        {service.photoVisible !== false && service.videoVisible !== false && mediaList.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MediaSlider
              videos={service.videos || []}
              images={service.images || []}
              darkMode={darkMode}
              autoPlayDuration={5000}
            />
          </motion.section>
        )}

        {/* Service Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ServiceDetailCard
            firstTitle={displayTitle}
            secondTitle={service.secondTitleVisible !== false ? displaySubtitle : undefined}
            description={service.descriptionVisible !== false ? displayDescription : undefined}
            rating={service.rating}
            ratingCount={service.ratingCount}
            warranty={service.warranty}
            minTime={service.minTimeVisible !== false ? service.minTime : undefined}
            maxTime={service.maxTimeVisible !== false ? service.maxTime : undefined}
            originalPrice={service.originalPriceVisible !== false ? service.originalPrice : undefined}
            currentPrice={service.currentPriceVisible !== false ? service.currentPrice : undefined}
            discountType={service.discountType}
            discountValue={service.discountValue}
            gst={service.gst}
            gstType={service.gstType}
            onViewDetails={onViewFullDetails}
            onBook={onBook}
            darkMode={darkMode}
            isNew={false}

          />
        </motion.section>

        {/* Additional Info (Optional) */}
        {service.warranty && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-2xl border ${darkMode
              ? 'bg-green-900/20 border-green-800 text-green-300'
              : 'bg-green-50 border-green-200 text-green-700'
              }`}
          >
            <div className="flex gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold mb-1">Warranty Included</h3>
                <p className="text-sm">{service.warranty}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Webview/Demo Link */}
        {service.webviewUrlVisible !== false && service.webviewUrl && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <a
              href={service.webviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-4 rounded-2xl border text-center font-semibold transition-all ${darkMode
                ? 'bg-blue-900/20 border-blue-800 text-blue-300 hover:bg-blue-900/40'
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                }`}
            >
              🎬 Watch Demo / Learn More
            </a>
          </motion.section>
        )}

        {/* Reviews Section (Placeholder) */}
        {service.reviews && service.reviews.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`border-t pt-6 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <h2 className="text-lg font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {service.reviews.slice(0, 3).map((review: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{review.author || 'Customer'}</span>
                    <span>{'⭐'.repeat(review.rating || 5)}</span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-20" />
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-md ${darkMode
        ? 'border-gray-800 bg-gray-900/90'
        : 'border-gray-100 bg-white/90'
        }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 ${darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
            >
              Add to Cart
            </button>
          )}
          {onBook && (
            <button
              onClick={onBook}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 ${darkMode
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900'
                }`}
            >
              Book Service
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ServicePreviewPage;
