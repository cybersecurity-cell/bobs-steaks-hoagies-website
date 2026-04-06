"use client";

import { useState, useRef } from "react";
import { Star, CheckCircle, Upload, X, AlertCircle } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
interface Review {
  id: string;
  name: string;
  rating: number;
  body: string;
  photo_url?: string;
  is_verified: boolean;
  approved_at?: string;
}

/* ── Sample approved reviews (mirrors DB seed) ──────────────── */
const SAMPLE_REVIEWS: Review[] = [
  { id: "1", name: "Marcus T.",  rating: 5, body: "Best cheesesteak in Philly. Period. The rib-eye is fire and the whiz is perfect.", is_verified: true,  approved_at: "2025-10-01" },
  { id: "2", name: "Destiny W.", rating: 5, body: "The AI ordering is actually wild — called at midnight and had my order in by the time I pulled up!", is_verified: true,  approved_at: "2025-10-05" },
  { id: "3", name: "James K.",   rating: 5, body: "Bob's Big Beautiful Bacon Burger is no joke. Come hungry.", is_verified: true,  approved_at: "2025-10-08" },
  { id: "4", name: "Keisha P.",  rating: 5, body: "Came in for lunch and stayed for dessert. The banana pudding got me.", is_verified: false, approved_at: "2025-10-12" },
  { id: "5", name: "Tony R.",    rating: 4, body: "Solid spot. Long line on a Friday but worth every minute. The chicken cutlet hoagie slaps.", is_verified: false, approved_at: "2025-10-15" },
];

/* ── Helpers ────────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          aria-label={`Rate ${s} star${s !== 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Optional photo */}
      {review.photo_url && (
        <img
          src={review.photo_url}
          alt="Review photo"
          className="w-full h-36 object-cover rounded-xl"
        />
      )}

      {/* Body */}
      <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{review.body}&rdquo;</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <p className="font-black text-gray-900 text-sm">{review.name}</p>
        {review.is_verified && (
          <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wide">
            <CheckCircle className="w-3 h-3" /> Verified Customer
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function ReviewSection() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState(""); // spam trap

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name   = "Name is required";
    if (rating === 0)        e.rating = "Please select a rating";
    if (body.trim().length < 10) e.body = "Review must be at least 10 characters";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    return e;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Photo must be under 5 MB" }));
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => { const { photo: _, ...rest } = prev; return rest; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check (if filled = bot)
    if (honeypot) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("rating", String(rating));
      formData.append("body", body.trim());
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
            What Philly Says
          </span>
          <h2 className="text-4xl font-black text-gray-900 mt-2">Customer Reviews</h2>
          <p className="text-gray-500 mt-2 text-base">
            Real people. Real cheesesteaks. All reviews are approved before publishing.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── Left: Approved reviews grid ── */}
          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-5">
              {SAMPLE_REVIEWS.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>

          {/* ── Right: Submission form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              {submitted ? (
                /* Success state */
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-black text-gray-900 text-xl mb-2">Thanks, {name}!</h3>
                  <p className="text-gray-500 text-sm">
                    Your review has been submitted and is pending approval. We&apos;ll publish it
                    shortly — usually within 24 hours.
                  </p>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="font-black text-gray-900 text-lg mb-1">Leave a Review</h3>
                  <p className="text-gray-400 text-xs mb-5">
                    Reviews go live once approved by our team.
                  </p>

                  {/* Global error */}
                  {errors.form && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.form}
                    </div>
                  )}

                  {/* Honeypot (hidden) */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Name <span className="text-[#C41230]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your first name"
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-[#C41230]/30 ${
                        errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#C41230]"
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email (optional) */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email <span className="text-gray-400 font-normal">(optional — for verification)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-[#C41230]/30 ${
                        errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#C41230]"
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Star rating */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Rating <span className="text-[#C41230]">*</span>
                    </label>
                    <StarPicker value={rating} onChange={(n) => { setRating(n); setErrors((p) => { const { rating: _, ...r } = p; return r; }); }} />
                    {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                  </div>

                  {/* Review text */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Review <span className="text-[#C41230]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-[#C41230]/30 resize-none ${
                        errors.body ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#C41230]"
                      }`}
                    />
                    <div className="flex justify-between mt-0.5">
                      {errors.body
                        ? <p className="text-red-500 text-xs">{errors.body}</p>
                        : <span />}
                      <p className="text-gray-400 text-xs">{body.length} chars</p>
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Photo <span className="text-gray-400 font-normal">(optional · max 5 MB)</span>
                    </label>
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#C41230] hover:text-[#C41230] transition-colors text-xs"
                      >
                        <Upload className="w-5 h-5" />
                        Click to upload a photo
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#C41230] hover:bg-[#960E23] disabled:bg-gray-300 text-white font-black py-3 rounded-full text-sm transition-all shadow hover:shadow-md"
                  >
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                  <p className="text-center text-gray-400 text-[10px] mt-3">
                    All reviews are moderated. We publish honest feedback — good and constructive.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
