import Link from "next/link";
import { Star, CheckCircle, PenLine } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  body: string;
  photo_url?: string;
  is_verified: boolean;
}

const SAMPLE_REVIEWS: Review[] = [
  { id: "1", name: "Marcus T.",  rating: 5, body: "Best cheesesteak in Philly. Period. The rib-eye is fire and the whiz is perfect.", is_verified: true  },
  { id: "2", name: "Destiny W.", rating: 5, body: "The AI ordering is actually wild — called at midnight and had my order in by the time I pulled up!", is_verified: true  },
  { id: "3", name: "James K.",   rating: 5, body: "Bob's Big Beautiful Bacon Burger is no joke. Come hungry.", is_verified: true  },
  { id: "4", name: "Keisha P.",  rating: 5, body: "Came in for lunch and stayed for dessert. The banana pudding got me.", is_verified: false },
  { id: "5", name: "Tony R.",    rating: 4, body: "Solid spot. Long line on a Friday but worth every minute. The chicken cutlet hoagie slaps.", is_verified: false },
];

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
        <img src={review.photo_url} alt="Review photo" className="w-full h-36 object-cover rounded-xl" />
      )}

      {/* Body */}
      <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{review.body}&rdquo;</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
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

export default function ReviewSection() {
  return (
    <section id="reviews" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
            What Philly Says
          </span>
          <h2 className="text-4xl font-black text-gray-900 mt-2">Customer Reviews</h2>
          <p className="text-gray-500 mt-2 text-base">
            Real people. Real cheesesteaks. All reviews are approved before publishing.
          </p>
        </div>

        {/* Review cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {SAMPLE_REVIEWS.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>

        {/* Leave a Review CTA */}
        <div className="text-center">
          <Link
            href="/reviews/submit"
            className="inline-flex items-center gap-2 bg-[#C41230] hover:bg-[#960E23] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow hover:shadow-md"
          >
            <PenLine className="w-4 h-4" />
            Leave a Review
          </Link>
          <p className="text-gray-400 text-xs mt-3">
            Your review goes live after approval — usually within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
