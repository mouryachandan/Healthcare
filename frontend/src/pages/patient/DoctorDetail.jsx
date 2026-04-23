import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, Star, MessageCircle } from 'lucide-react';
import client from '../../api/client';

export default function DoctorDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [doc, setDoc] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get(`/doctors/${id}`);
        setDoc(data);
      } catch {
        setDoc(null);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !date) return;
    (async () => {
      try {
        const { data } = await client.get(`/doctors/${id}/slots`, { params: { date } });
        setSlots(data.slots || []);
        setSlot('');
      } catch {
        setSlots([]);
      }
    })();
  }, [id, date]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await client.get(`/reviews/doctor/${id}`);
        setReviews(data);
      } catch {
        setReviews([]);
      }
    })();
  }, [id]);

  async function book() {
    setMsg('');
    try {
      await client.post('/appointments', {
        doctorId: id,
        date,
        timeSlot: slot,
      });
      setMsg('Booking requested! Await doctor approval.');
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Could not book');
    }
  }

  async function submitReview() {
    try {
      await client.post('/reviews', { doctorId: id, rating, comment });
      const { data } = await client.get(`/reviews/doctor/${id}`);
      setReviews(data);
      setComment('');
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Review failed');
    }
  }

  if (!doc) return <p className="text-slate-500">Doctor not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="rounded-3xl overflow-hidden shadow-lift bg-white border border-slate-100">
        <div className="h-40 bg-gradient-to-r from-cyan-brand to-navy relative">
          <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-navy">
            {doc.name?.charAt(0)}
          </div>
        </div>
        <div className="pt-12 px-6 pb-6">
          <h1 className="font-display text-2xl font-bold text-navy">{doc.name}</h1>
          <p className="text-slate-600">
            {doc.specialization}
            {doc.hospital ? ` — ${doc.hospital}` : ''}
          </p>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            {doc.ratingAvg} ({doc.reviewCount} reviews) · ₹{doc.fees}
          </p>
          {doc.bio && <p className="mt-4 text-sm text-slate-600 leading-relaxed">{doc.bio}</p>}
          <button
            type="button"
            onClick={() => nav(`/patient/chat/${doc.userId}`)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600"
          >
            <MessageCircle className="w-4 h-4" /> Chat with doctor
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card">
        <h2 className="font-display font-bold text-lg text-navy mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Book an appointment
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Time slot</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="">Select…</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {msg && <p className="mt-3 text-sm text-emerald-600">{msg}</p>}
        <button
          type="button"
          onClick={book}
          disabled={!slot}
          className="mt-4 w-full sm:w-auto rounded-2xl bg-navy text-white px-8 py-3 font-semibold disabled:opacity-50"
        >
          Set appointment
        </button>
        <p className="text-xs text-slate-400 mt-2">
          Doctor must publish availability for the chosen day. Ask them to add slots in their dashboard.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card">
        <h2 className="font-bold text-navy mb-4">Reviews</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="rounded-xl border px-2 py-1 text-sm"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} stars
              </option>
            ))}
          </select>
          <input
            className="flex-1 min-w-[200px] rounded-xl border px-3 py-1 text-sm"
            placeholder="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="button"
            onClick={submitReview}
            className="rounded-xl bg-cyan-brand text-white px-4 py-1 text-sm font-semibold"
          >
            Submit
          </button>
        </div>
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="text-sm border-b border-slate-100 pb-2">
              <span className="font-semibold">{r.userId?.name || 'Patient'}</span> — ★{r.rating}
              <p className="text-slate-600">{r.comment}</p>
            </li>
          ))}
        </ul>
      </div>

      <Link to="/patient/doctors" className="text-sky-600 text-sm font-medium">
        ← Back to doctors
      </Link>
    </div>
  );
}
