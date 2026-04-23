import { useState } from 'react';
import client from '../../api/client';

export default function DoctorUpload() {
  const [appointmentId, setAppointmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    if (!file) {
      setMsg('Choose a file');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('appointmentId', appointmentId);
    fd.append('notes', notes);
    try {
      await client.post('/prescriptions/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Uploaded successfully.');
      setFile(null);
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Upload failed (configure Cloudinary on server)');
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Upload prescription</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card space-y-4"
      >
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Appointment ID"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <button
          type="submit"
          className="rounded-xl bg-blue-700 text-white px-6 py-2 font-semibold"
        >
          Upload to Cloudinary
        </button>
      </form>
    </div>
  );
}
