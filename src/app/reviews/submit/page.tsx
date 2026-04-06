"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Star, CheckCircle, Upload, X, AlertCircle, ArrowLeft } from "lucide-react";

/* ── Interactive star picker ── */
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
            className={`w-8 h-8 transition-colors ${
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

export default function ReviewSubmitPage() {
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [rating,       setRating]       = useState(0);
  const [body,         setBody]         = useState("");
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [honeypot,     setHoneypot]     = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())              e.name   = "Name is required";
    if (rating === 0)              e.rating = "Please select a rating";
    if (body.trim().length < 10)   e.body   = "Review must be at least 10 characters";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    return e;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: "Photo must be under 5 MB" }));
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((p) => { const { photo: _, ...rest } = p; return rest; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot trap

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name",   name.trim());
      fd.append("email",  email.trim());
      fd.append("rating", String(rating));
      fd.append("body",   body.trim());
      if (photoFile) fd.append("photo", photoFile);

      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* Hero strip */}
      <div className="bg-black text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-black mb-2">Leave a Review</h1>
        <p className="text-gray-400 text-lg">
          Tell Philly what you think. Every review is read and approved by our team.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">

        {/* Back link */}
        <Link
          href="/#reviews"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reviews
        </Link>

        {submitted ? (
          /* ── Success ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-black text-gray-900 text-2xl mb-2">Thanks, {name}!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your review has been submitted and is pending approval.
              We&apos;ll publish it shortly — usually within 24 hours.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#C41230] hover:bg-[#960E23] text-white px-6 py-3 rounded-full font-bold text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

            {errors.form && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Honeypot */}
              <input
                type="text" name="website" value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true"
              />

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Name <span className="text-[#C41230]">*</span>
                </label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#C41230]/30 transition-colors ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#C41230]"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email <span className="text-gray-400 font-normal">(optional — for verification)</span>
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#C41230]/30 transition-colors ${
                    errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#C41230]"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Rating <span className="text-[#C41230]">*</span>
                </label>
                <StarPicker
                  value={rating}
                  onChange={(n) => { setRating(n); setErrors((p) => { const { rating: _, ...r } = p; return r; }); }}
                />
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
              </div>

              {/* Review body */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Review <span className="text-[#C41230]">*</span>
                </label>
                <textarea
                  rows={5} value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell us about your experience…"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#C41230]/30 resize-none transition-colors ${
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
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Photo <span className="text-gray-400 font-normal">(optional · max 5 MB)</span>
                </label>
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
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
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#C41230] hover:text-[#C41230] transition-colors text-xs"
                  >
                    <Upload className="w-5 h-5" />
                    Click to upload a photo
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C41230] hover:bg-[#960E23] disabled:bg-gray-300 text-white font-black py-3.5 rounded-full text-sm transition-all shadow hover:shadow-md"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>

              <p className="text-center text-gray-400 text-[10px]">
                All reviews are moderated. We publish honest feedback — good and constructive.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
