import { useEffect, useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import client from '../../api/client';

export default function PrescriptionsPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/prescriptions/mine');
        setList(data);
      } catch {
        setList([]);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy mb-4 flex items-center gap-2">
        <FileText className="w-7 h-7" /> Prescriptions & reports
      </h1>
      <div className="space-y-3">
        {list.map((p) => (
          <div
            key={p._id}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex justify-between gap-3"
          >
            <div>
              <p className="font-semibold">
                Dr. {p.doctorId?.userId?.name || 'Doctor'}
              </p>
              <p className="text-xs text-slate-500">
                {p.appointmentId?.date
                  ? new Date(p.appointmentId.date).toLocaleDateString()
                  : ''}{' '}
                · {p.notes || 'No notes'}
              </p>
            </div>
            {p.fileUrl ? (
              <a
                href={p.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-sky-600 font-medium"
              >
                Open <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="text-xs text-slate-400">No file</span>
            )}
          </div>
        ))}
        {!list.length && <p className="text-slate-500">Nothing uploaded yet.</p>}
      </div>
    </div>
  );
}
