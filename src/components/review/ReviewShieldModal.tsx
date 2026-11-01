import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  Gift,
  MessageSquareHeart,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useTableSession } from '../../context/TableSessionContext';
import { RESTAURANT_CONFIG } from '../../data/menuData';

const ISSUE_CATEGORIES = [
  'Food Temperature / Taste',
  'Service Speed',
  'Portion Size',
  'Ambience & Music',
  'Billing Experience',
];

export const ReviewShieldModal: React.FC = () => {
  const {
    tableNumber,
    review,
    isReviewOpen,
    setIsReviewOpen,
    submitReview,
  } = useTableSession();

  const [selectedStars, setSelectedStars] = useState<number>(
    review?.rating || 5
  );
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [issueCategory, setIssueCategory] = useState<string>(
    ISSUE_CATEGORIES[0]
  );
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [privateSubmitted, setPrivateSubmitted] = useState<boolean>(
    Boolean(review?.privateSubmitted)
  );
  const [couponUnlocked, setCouponUnlocked] = useState<boolean>(
    Boolean(review?.couponCode)
  );

  const activeRating = hoverStars || selectedStars;

  const handleVipAction = () => {
    setCouponUnlocked(true);
    submitReview({
      rating: selectedStars,
      submittedAt: new Date().toISOString(),
      couponCode: 'AURA-VIP-KULFI12',
    });
  };

  const handlePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrivateSubmitted(true);
    submitReview({
      rating: selectedStars,
      submittedAt: new Date().toISOString(),
      issueCategory,
      feedbackText: feedbackText.trim(),
      privateSubmitted: true,
    });
  };

  return (
    <AnimatePresence>
      {isReviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-shield-title"
          data-testid="review-shield-modal"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
        >
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReviewOpen(false)}
            className="fixed inset-0 bg-[#29251F]/60 backdrop-blur-sm"
          />

          {/* Dialog Container: Solid Opaque Pure Cream */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            style={{ backgroundColor: '#FCFAF6' }}
            className="relative z-10 w-full max-w-[480px] md:max-w-[540px] max-h-[90dvh] md:max-h-[85vh] flex flex-col rounded-t-[28px] md:rounded-2xl bg-cream border border-taupe shadow-2xl overflow-hidden"
          >
            {/* Top Handle on Mobile */}
            <div className="w-10 h-1 rounded-full bg-taupe mx-auto mt-3 mb-1 shrink-0 md:hidden" />

            <div
              style={{ backgroundColor: '#FCFAF6' }}
              className="px-5 sm:px-6 py-3.5 border-b border-taupe flex items-center justify-between bg-cream"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brass-dark">
                Guest Experience • Table #{tableNumber}
              </span>
              <button
                type="button"
                aria-label="Close review modal"
                data-testid="close-review-modal"
                onClick={() => setIsReviewOpen(false)}
                className="w-8 h-8 rounded-full bg-ivory hover:bg-taupe/40 border border-taupe flex items-center justify-center text-warm-grey hover:text-espresso transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              style={{ backgroundColor: '#FCFAF6' }}
              className="p-5 sm:p-6 overflow-y-auto space-y-6 pb-8 no-scrollbar bg-cream"
            >
              {/* Headline & 5 Interactive Stars */}
              <div className="text-center space-y-3">
                <h2
                  id="review-shield-title"
                  className="font-serif text-[24px] sm:text-[27px] font-medium text-espresso leading-snug"
                >
                  How was your dining experience at AURA today?
                </h2>
                <p className="text-[12.5px] text-warm-grey">
                  Tap a star to rate your experience at Table #{tableNumber}
                </p>

                <div
                  role="radiogroup"
                  aria-label="Star Rating"
                  className="flex items-center justify-center gap-2 pt-2"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= activeRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={selectedStars === star}
                        aria-label={`Rate ${star} out of 5 stars`}
                        data-testid={`review-star-${star}`}
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(0)}
                        onClick={() => {
                          setSelectedStars(star);
                          setPrivateSubmitted(false);
                        }}
                        className="p-2 rounded-xl bg-porcelain border border-taupe hover:border-brass/60 active:scale-95 transition-all shadow-subtle"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            filled
                              ? 'fill-brass text-brass'
                              : 'text-stone stroke-[1.5]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Routing: 4–5 Stars -> VIP Privilege & Google Maps */}
              {selectedStars >= 4 ? (
                <motion.div
                  key="vip-4-5-stars"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid="vip-review-experience"
                  className="bg-porcelain rounded-2xl p-5 border border-brass/30 text-center space-y-4 shadow-subtle"
                >
                  <div className="w-12 h-12 rounded-xl bg-brass/10 border border-brass/25 flex items-center justify-center mx-auto text-brass-dark">
                    <Gift className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brass-dark">
                      VIP Hospitality Privilege
                    </span>
                    <h3 className="font-serif text-[20px] font-medium text-espresso mt-1">
                      Thank you for dining at AURA.
                    </h3>
                    <p className="text-[12.5px] text-warm-grey mt-1.5 leading-relaxed">
                      Share your experience on Google Maps to unlock a
                      complimentary Chef&apos;s Saffron Pistachio Kulfi on your
                      next visit.
                    </p>
                  </div>

                  {couponUnlocked && (
                    <div
                      data-testid="demo-dessert-coupon"
                      className="p-3.5 rounded-xl bg-forest/10 border border-forest/30 text-left flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
                          VIP Privilege Voucher Unlocked
                        </span>
                        <p className="text-[14px] font-mono font-bold text-espresso mt-0.5">
                          AURA-VIP-KULFI12
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-forest" />
                    </div>
                  )}

                  <a
                    href={RESTAURANT_CONFIG.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="google-maps-review-cta"
                    onClick={handleVipAction}
                    className="w-full py-3.5 px-4 rounded-xl bg-olive hover:bg-olive-hover text-cream font-semibold text-[13px] shadow-subtle flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Sparkles className="w-4 h-4 text-brass" />
                    <span>Post to Google Maps & Unlock Dessert</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </motion.div>
              ) : (
                /* Conditional Routing: 1–3 Stars -> Private Concierge Feedback */
                <motion.div
                  key="private-1-3-stars"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid="private-feedback-experience"
                  className="bg-porcelain rounded-2xl p-5 border border-taupe space-y-4 shadow-subtle"
                >
                  {privateSubmitted ? (
                    <div
                      data-testid="private-feedback-confirmation"
                      className="text-center py-4 space-y-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/30 flex items-center justify-center mx-auto text-forest">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-[20px] font-medium text-espresso">
                        Thank you for sharing your thoughts directly.
                      </h3>
                      <p className="text-[12.5px] text-warm-grey">
                        Your note has been delivered directly to our General Manager on
                        duty for Table #{tableNumber}.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePrivateSubmit} className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brass/10 border border-brass/20 text-brass-dark flex items-center justify-center shrink-0">
                          <MessageSquareHeart className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-espresso">
                            Tell us what could have been better.
                          </h3>
                          <p className="text-[11px] text-warm-grey">
                            Direct message to our culinary & floor leadership
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-stone mb-1.5">
                          Category of Concern (Optional)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {ISSUE_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setIssueCategory(cat)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium border transition-all ${
                                issueCategory === cat
                                  ? 'bg-cream border-olive text-espresso shadow-subtle'
                                  : 'bg-ivory/50 border-taupe text-warm-grey hover:bg-cream'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="private-feedback-textarea"
                          className="block text-[10.5px] font-semibold uppercase tracking-wider text-stone mb-1.5"
                        >
                          Your Direct Feedback
                        </label>
                        <textarea
                          id="private-feedback-textarea"
                          data-testid="private-feedback-textarea"
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Share details so our manager can address this right away..."
                          className="w-full rounded-lg bg-cream border border-taupe focus:border-olive focus:outline-none p-3 text-[13px] text-espresso placeholder:text-warm-grey resize-none shadow-subtle"
                        />
                      </div>

                      <button
                        type="submit"
                        data-testid="submit-private-feedback-btn"
                        className="w-full h-11 rounded-xl bg-olive hover:bg-olive-hover text-cream font-semibold text-[13px] shadow-subtle active:scale-[0.98] transition-transform"
                      >
                        Submit Privately to Management
                      </button>
                    </form>
                  )}

                  {/* Public review fallback */}
                  <div className="pt-2 border-t border-taupe/60 text-center">
                    <a
                      href={RESTAURANT_CONFIG.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="public-google-review-fallback-link"
                      className="inline-flex items-center gap-1 text-[11px] text-warm-grey hover:text-espresso underline underline-offset-4"
                    >
                      <span>Prefer to post a public review on Google Maps?</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
