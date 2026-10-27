import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, History, Save, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { updateProfile, changePassword } from '../services/api';
import QueueStatus from '../components/QueueStatus';

const formatTime = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-');
const inputClass =
  'w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400';

/**
 * Account page: profile, password change and the full booking history.
 */
export default function Account() {
  const { user, setUser } = useAuth();
  const { bookings, loadError } = useQueue();
  const [name, setName] = useState(user.name);
  const [nameMessage, setNameMessage] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    setNameMessage(null);
    try {
      const { user: updated } = await updateProfile(name.trim());
      setUser(updated);
      setNameMessage({ ok: true, text: 'Name updated.' });
    } catch (err) {
      setNameMessage({ ok: false, text: err.fields?.name || err.message });
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (passwords.next !== passwords.confirm) {
      setPasswordMessage({ ok: false, text: 'The new passwords do not match.' });
      return;
    }
    setSaving(true);
    try {
      const result = await changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordMessage({ ok: true, text: result.message });
    } catch (err) {
      setPasswordMessage({ ok: false, text: err.fields?.currentPassword || err.fields?.newPassword || err.message });
    } finally {
      setSaving(false);
    }
  };

  const Message = ({ message }) =>
    message && <p className={`text-xs ${message.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{message.text}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">MY ACCOUNT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">{user.name}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {user.email} • Tourist account • Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <form onSubmit={saveName} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-cyan-400" /> Profile</h2>
          <label className="block text-xs text-slate-400">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs text-slate-400">
            Email (cannot be changed)
            <input value={user.email} disabled className={`${inputClass} mt-1 opacity-60`} />
          </label>
          <Message message={nameMessage} />
          <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save
          </button>
        </form>

        <form onSubmit={savePassword} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-400" /> Change password</h2>
          <input type="password" autoComplete="current-password" placeholder="Current password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className={inputClass} />
          <input type="password" autoComplete="new-password" placeholder="New password (8+ characters, letters and numbers)" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className={inputClass} />
          <input type="password" autoComplete="new-password" placeholder="Repeat new password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className={inputClass} />
          <Message message={passwordMessage} />
          <button type="submit" disabled={saving || !passwords.current || !passwords.next} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> {saving ? 'Saving...' : 'Change password'}
          </button>
          <p className="text-[10px] text-slate-500">Changing your password logs you out on all other devices.</p>
        </form>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono uppercase text-slate-400">
          <span className="flex items-center gap-2"><History className="w-4 h-4 text-cyan-400" /> Booking history ({bookings.length})</span>
          <Link to="/queue" className="text-cyan-300 hover:underline normal-case">Open My Queue</Link>
        </div>
        {loadError && <p className="p-4 text-xs text-rose-300">{loadError}</p>}
        {bookings.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">
            No bookings yet. <Link to="/destinations" className="text-cyan-300 underline">Explore destinations</Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-slate-500 text-[11px] uppercase">
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-2">Booking</th>
                  <th className="text-left px-3 py-2">Destination</th>
                  <th className="text-left px-3 py-2">People</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Booked</th>
                  <th className="text-left px-5 py-2">Completed / ended</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="border-b border-slate-800/60 text-slate-300">
                    <td className="px-5 py-2.5 text-cyan-300">{b.bookingId}</td>
                    <td className="px-3 py-2.5">
                      <Link to={`/destinations/${b.destinationId}`} className="hover:text-cyan-300">{b.destinationName}</Link>
                      <span className="block text-[10px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{b.destinationLocation}</span>
                    </td>
                    <td className="px-3 py-2.5">{b.numberOfPeople}</td>
                    <td className="px-3 py-2.5">
                      <QueueStatus status={b.status} size="sm" />
                      {b.status === 'WAITING' && <span className="block text-[10px] text-amber-300 mt-1">Position #{b.queuePosition}</span>}
                    </td>
                    <td className="px-3 py-2.5">{formatTime(b.createdAt)}</td>
                    <td className="px-5 py-2.5 text-slate-400">
                      {formatTime(b.checkedOutAt || b.cancelledAt)}
                      {b.endedReason && <span className="block text-[10px] text-slate-500">{b.endedReason}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
