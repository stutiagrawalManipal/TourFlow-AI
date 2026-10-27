import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, ScanLine, ClipboardList, ListOrdered, Activity, Users, Ticket, LogIn, LogOut, XCircle, Search, RefreshCw,
  Save, MapPinned, ScrollText, UserX, AlertTriangle, Plus, Trash2, ArrowUp, ArrowDown, ShieldAlert, BadgeCheck,
} from 'lucide-react';
import {
  fetchAdminStats, fetchAdminBookings, lookupBooking, updateBookingStatus, fetchAdminQueue, fetchCrowdOverview,
  updateDestinationSettings, fetchDestinations, fetchDestinationContent, saveDestinationContent, saveDestinationImages, fetchAuditLog,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import QueueStatus from '../components/QueueStatus';
import CrowdBadge from '../components/CrowdBadge';
import DestinationImage, { ImageCredit } from '../components/DestinationImage';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'checkin', label: 'Check-in / out', icon: ScanLine },
  { id: 'queues', label: 'Queues & Settings', icon: ListOrdered },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'destinations', label: 'Destinations', icon: MapPinned },
  { id: 'crowd', label: 'Crowd', icon: Activity },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

const STATUSES = ['', 'WAITING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];
const formatTime = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-');
const card = 'bg-slate-900/80 border border-slate-800 rounded-2xl';
const inputClass = 'bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400';

// Reason dialog texts for actions that need a written reason (all are audited)
const REASON_ACTIONS = {
  cancel: { title: 'Cancel booking', help: 'Why is staff cancelling this booking? The tourist will see this reason.', button: 'Cancel booking' },
  'no-show': { title: 'Mark as no-show', help: 'The group at the front of the queue did not come. Describe what happened.', button: 'Mark no-show' },
  override: {
    title: 'Override FIFO and check in early',
    help: 'This group is not at the front of the queue. Letting them in early skips other visitors, so a reason is required and the action is recorded in the audit log.',
    button: 'Override & check in',
  },
};

/**
 * Admin dashboard. Every request here is checked by the backend
 * (role "admin" from the database), so the page is useless to anyone else.
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [message, setMessage] = useState(null);
  const [reasonFor, setReasonFor] = useState(null); // { booking, kind, onDone }

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 6000);
  };

  // All status changes go through here. Returns the updated booking or null.
  const runAction = async (booking, action, options = {}) => {
    try {
      const updated = await updateBookingStatus(booking.bookingId, action, options);
      notify('ok', `${updated.bookingId} is now ${updated.status.replace('_', ' ').toLowerCase()}.`);
      return updated;
    } catch (err) {
      notify('error', err.message);
      return null;
    }
  };

  // Called by the booking buttons. Some actions first ask for a reason.
  const requestAction = (booking, kind, onDone) => {
    if (REASON_ACTIONS[kind]) {
      setReasonFor({ booking, kind, onDone });
      return;
    }
    runAction(booking, kind).then((updated) => updated && onDone?.(updated));
  };

  const submitReason = async (reason) => {
    const { booking, kind, onDone } = reasonFor;
    const updated =
      kind === 'override' ? await runAction(booking, 'check-in', { override: true, reason }) : await runAction(booking, kind, { reason });
    if (updated) {
      setReasonFor(null);
      onDone?.(updated);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-semibold">ADMIN PORTAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">Operations Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Signed in as {user?.name} ({user?.email}). All actions are recorded in the audit log.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap border ${
              tab === id ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div role="status" className={`p-3 rounded-xl text-xs font-mono border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {message.text}
        </div>
      )}

      {tab === 'overview' && <Overview />}
      {tab === 'checkin' && <CheckIn requestAction={requestAction} />}
      {tab === 'queues' && <Queues requestAction={requestAction} notify={notify} />}
      {tab === 'bookings' && <Bookings requestAction={requestAction} />}
      {tab === 'destinations' && <DestinationEditor notify={notify} />}
      {tab === 'crowd' && <Crowd />}
      {tab === 'audit' && <AuditLog />}

      {reasonFor && <ReasonDialog {...REASON_ACTIONS[reasonFor.kind]} booking={reasonFor.booking} onCancel={() => setReasonFor(null)} onSubmit={submitReason} />}
    </div>
  );
}

// ---------------------------------------------------------------- reason dialog
function ReasonDialog({ title, help, button, booking, onCancel, onSubmit }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = reason.trim().length >= 10;
  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    await onSubmit(reason.trim());
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reason-title">
      <form onSubmit={submit} className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 id="reason-title" className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-xs text-slate-400">
          {booking.bookingId} • {booking.destinationName} • {booking.numberOfPeople} people{booking.queuePosition ? ` • queue position #${booking.queuePosition}` : ''}
        </p>
        <p className="text-xs text-slate-300">{help}</p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Reason (at least 10 characters)"
          className={`${inputClass} w-full`}
        />
        <p className="text-[10px] text-slate-500">{reason.trim().length}/500 characters • recorded in the audit log with your name</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm">Back</button>
          <button type="submit" disabled={!valid || busy} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-sm">
            {busy ? 'Saving...' : button}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Overview
function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const load = () => fetchAdminStats().then(setStats).catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorBox text={error} />;
  if (!stats) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Waiting Now" value={stats.peopleWaiting} subtitle={`${stats.waiting} bookings in queues`} icon={Ticket} accent="cyan" badge="QUEUE" />
        <StatCard title="Checked In" value={stats.peopleInside} subtitle={`${stats.checkedIn} groups inside`} icon={LogIn} accent="emerald" badge="INSIDE" />
        <StatCard title="Bookings Today" value={stats.bookingsToday} subtitle={`${stats.totalBookings} in total`} icon={ClipboardList} accent="amber" badge="TODAY" />
        <StatCard title="Tourists" value={stats.registeredTourists} subtitle="Registered accounts" icon={Users} accent="indigo" badge="USERS" />
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono uppercase text-slate-400">
          <span>Destinations with active queues</span>
          <button onClick={load} className="text-slate-400 hover:text-white" aria-label="Refresh"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {stats.activeDestinations.length === 0 ? (
          <p className="p-6 text-xs text-slate-400 text-center">No one is waiting or checked in anywhere yet.</p>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead className="text-slate-500 text-[11px] uppercase">
              <tr className="border-b border-slate-800"><th className="text-left px-5 py-2">Destination</th><th className="text-right px-3 py-2">Waiting</th><th className="text-right px-5 py-2">Inside</th></tr>
            </thead>
            <tbody>
              {stats.activeDestinations.map((d) => (
                <tr key={d.destinationId} className="border-b border-slate-800/60 text-slate-300">
                  <td className="px-5 py-2.5"><Link to={`/destinations/${d.destinationId}`} className="hover:text-cyan-300">{d.destinationName}</Link></td>
                  <td className="px-3 py-2.5 text-right text-cyan-300">{d.peopleWaiting}</td>
                  <td className="px-5 py-2.5 text-right text-emerald-300">{d.peopleInside}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="px-5 py-3 text-[10px] text-slate-500 border-t border-slate-800">
          Status totals: {stats.waiting} waiting • {stats.checkedIn} checked in • {stats.checkedOut} completed • {stats.cancelled} cancelled • {stats.noShow} no-show. Updated {formatTime(stats.generatedAt)}.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Check-in
function CheckIn({ requestAction }) {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const find = async (e) => {
    e?.preventDefault();
    setBooking(null);
    setError('');
    if (!code.trim()) return setError('Enter a booking ID, pass code or the text from the QR code.');
    try {
      setBooking(await lookupBooking(code.trim()));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <form onSubmit={find} className={`${card} p-6 space-y-3`}>
        <h2 className="text-sm font-bold text-white">Find a booking</h2>
        <p className="text-xs text-slate-400">
          Type the booking ID (e.g. TF-1A2B3C), the 8-character pass code, or paste the QR code text (TOURFLOW:...).
          Camera scanning is not built in; any phone QR scanner app can read the pass and copy its text.
        </p>
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="TF-1A2B3C or pass code" className={`${inputClass} flex-grow`} />
          <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Find
          </button>
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
      </form>

      {booking && (
        <div className={`${card} p-6 space-y-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-cyan-400">{booking.bookingId}</p>
              <h3 className="text-lg font-bold text-white">{booking.destinationName}</h3>
              <p className="text-xs text-slate-400">{booking.user ? `${booking.user.name} • ${booking.user.email}` : 'Unknown user'}</p>
            </div>
            <QueueStatus status={booking.status} size="sm" />
          </div>
          <p className={`text-[11px] font-mono flex items-center gap-1 ${booking.passVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
            {booking.passVerified ? <BadgeCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {booking.passVerified ? 'Pass code verified' : 'Found by booking ID only - ask to see the QR pass to confirm'}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <Detail label="People" value={booking.numberOfPeople} />
            <Detail label="Queue position" value={booking.queuePosition ? `#${booking.queuePosition}` : '-'} />
            <Detail label="Ticket no." value={booking.ticketNumber} />
            <Detail label="Pass code" value={booking.pass.code} />
            <Detail label="Booked" value={formatTime(booking.createdAt)} />
            <Detail label="Checked in" value={formatTime(booking.checkedInAt)} />
          </div>
          {booking.status === 'WAITING' && booking.queuePosition > 1 && (
            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              FIFO: {booking.queuePosition - 1} booking(s) are ahead of this group. Serve them first, or use an override with a reason.
            </p>
          )}
          <ActionButtons booking={booking} isFront={booking.queuePosition === 1} onAction={(kind) => requestAction(booking, kind, (updated) => setBooking({ ...booking, ...updated }))} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Bookings
function Bookings({ requestAction }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetchAdminBookings({ search, status })
      .then((data) => {
        setBookings(data);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search booking ID, pass code, destination, name or email" className={`${inputClass} flex-grow`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>)}
        </select>
      </div>
      {error && <ErrorBox text={error} />}
      {!bookings ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <p className="p-8 text-center text-xs text-slate-400">No bookings match.</p>
      ) : (
        <BookingTable bookings={bookings} showDestination onAction={(b, kind) => requestAction(b, kind, load)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Queues & settings
function Queues({ requestAction, notify }) {
  const [destinations, setDestinations] = useState([]);
  const [destinationId, setDestinationId] = useState('');
  const [queue, setQueue] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDestinations()
      .then((list) => {
        const busy = (d) => d.crowd.peopleWaiting + d.crowd.peopleInside;
        const sorted = [...list].sort((a, b) => busy(b) - busy(a) || a.name.localeCompare(b.name));
        setDestinations(sorted);
        if (sorted.length) setDestinationId(sorted[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const load = useCallback(() => {
    if (!destinationId) return;
    fetchAdminQueue(destinationId)
      .then((data) => {
        setQueue(data);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [destinationId]);

  // settings form only reloads when the destination changes (not every refresh)
  useEffect(() => {
    if (!destinationId) return;
    fetchAdminQueue(destinationId).then((data) => setSettings({ ...data.settings })).catch(() => {});
  }, [destinationId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateDestinationSettings(destinationId, {
        ...settings,
        entryRatePerMinute: Number(settings.entryRatePerMinute),
        maxQueuePeople: Number(settings.maxQueuePeople),
      });
      notify('ok', 'Queue settings saved.');
      load();
    } catch (err) {
      notify('error', err.fields ? Object.values(err.fields).join(' ') : err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className={`${inputClass} flex-grow`}>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.state}){d.crowd.peopleWaiting || d.crowd.peopleInside ? ` - ${d.crowd.peopleWaiting} waiting, ${d.crowd.peopleInside} inside` : ''}
            </option>
          ))}
        </select>
        <button onClick={load} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
      {error && <ErrorBox text={error} />}

      {queue && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-800 text-xs font-mono uppercase text-slate-400 flex justify-between">
                <span>Waiting - FIFO order ({queue.waiting.length})</span>
                <span className="normal-case text-slate-500">Only #1 can be checked in normally</span>
              </div>
              {queue.waiting.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">No one is waiting.</p>
              ) : (
                <BookingTable bookings={queue.waiting} onAction={(b, kind) => requestAction(b, kind, load)} />
              )}
            </div>
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">Checked in now ({queue.inside.length})</div>
              {queue.inside.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">Nobody is checked in.</p>
              ) : (
                <BookingTable bookings={queue.inside} onAction={(b, kind) => requestAction(b, kind, load)} />
              )}
            </div>
            {queue.finished.length > 0 && (
              <div className={`${card} overflow-hidden`}>
                <div className="px-5 py-3 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">Finished in the last 24 hours ({queue.finished.length})</div>
                <BookingTable bookings={queue.finished} onAction={() => {}} />
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className={`${card} p-5 space-y-2 text-xs`}>
              <h3 className="text-sm font-bold text-white mb-2">Crowd estimate</h3>
              <div className="flex justify-between items-center"><span className="text-slate-400">Level</span><CrowdBadge level={queue.crowd.crowdLevel} size="sm" /></div>
              <div className="flex justify-between"><span className="text-slate-400">Season</span><span className="text-slate-200">{queue.crowd.season}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Est. wait for new booking</span><span className="text-emerald-300">~{queue.crowd.estimatedWaitMinutes} min</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Entry rate</span><span className="text-slate-200">{queue.crowd.entryRatePerMinute}/min {queue.crowd.entryRateMeasured ? '(measured)' : '(assumed)'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Queue places left</span><span className="text-slate-200">{queue.crowd.placesLeft} / {queue.crowd.maxQueuePeople}</span></div>
              <p className="text-[10px] text-slate-500 pt-2">{queue.crowd.dataSource}</p>
            </div>

            <form onSubmit={saveSettings} className={`${card} p-5 space-y-3 text-xs`}>
              <h3 className="text-sm font-bold text-white">Queue settings</h3>
              <label className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Queue open for new bookings</span>
                <input type="checkbox" checked={settings.queueOpen} onChange={(e) => setSettings({ ...settings, queueOpen: e.target.checked })} className="w-4 h-4 accent-amber-500" />
              </label>
              <label className="block">
                <span className="text-slate-300 block mb-1">Queue capacity (max people waiting)</span>
                <input type="number" min="1" max="100000" value={settings.maxQueuePeople} onChange={(e) => setSettings({ ...settings, maxQueuePeople: e.target.value })} className={`${inputClass} w-full`} />
              </label>
              <label className="block">
                <span className="text-slate-300 block mb-1">Planned entry rate (people per minute)</span>
                <input type="number" step="0.1" min="0.1" max="100" value={settings.entryRatePerMinute} onChange={(e) => setSettings({ ...settings, entryRatePerMinute: e.target.value })} className={`${inputClass} w-full`} />
                <span className="text-[10px] text-slate-500">Used for wait estimates until 5+ check-ins happen within an hour.</span>
              </label>
              <label className="block">
                <span className="text-slate-300 block mb-1">Notice shown to tourists</span>
                <input maxLength={200} value={settings.notice} onChange={(e) => setSettings({ ...settings, notice: e.target.value })} placeholder="e.g. Gate 2 closed for maintenance" className={`${inputClass} w-full`} />
              </label>
              <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5">
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Destinations (content + photographs)
const EMPTY_FACT = { text: '', verified: false, sourceUrl: '' };
const EMPTY_IMAGE = { url: '', alt: '', credit: '', license: '', licenseUrl: '', sourceUrl: '' };
const TEXT_FIELDS = [
  ['historicalBackground', 'Historical background', 6],
  ['significance', 'Cultural or religious significance', 4],
  ['visitorGuidelines', 'Visitor guidelines (dress code, items not allowed, photography rules ...)', 4],
  ['accessibilityNotes', 'Accessibility (wheelchair access, ramps, toilets, seating ...)', 3],
  ['guideInfo', 'Tourist guide information (official guides, languages, where to find them)', 3],
];

function DestinationEditor({ notify }) {
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [data, setData] = useState(null);
  const [content, setContent] = useState(null);
  const [images, setImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchCrowdOverview()
      .then((rows) => {
        const sorted = [...rows].sort((a, b) => a.destinationName.localeCompare(b.destinationName));
        setDestinations(sorted);
        if (sorted.length) setDestinationId(sorted[0].destinationId);
      })
      .catch((err) => notify('error', err.message));
  }, []);

  useEffect(() => {
    if (!destinationId) return;
    setData(null);
    setFieldErrors({});
    fetchDestinationContent(destinationId)
      .then((result) => {
        const c = result.content || {};
        setData(result);
        setContent({
          ...Object.fromEntries(TEXT_FIELDS.map(([key]) => [key, c[key] || ''])),
          visitDuration: c.visitDuration || '',
          openingHours: { ...EMPTY_FACT, ...(c.openingHours || {}) },
          entryFees: { ...EMPTY_FACT, ...(c.entryFees || {}) },
          faqs: c.faqs || [],
        });
        setImages((result.images || []).map((img) => ({ ...EMPTY_IMAGE, ...img })));
      })
      .catch((err) => notify('error', err.message));
  }, [destinationId]);

  const saveContent = async () => {
    setBusy(true);
    setFieldErrors({});
    try {
      await saveDestinationContent(destinationId, content);
      notify('ok', 'Destination information saved.');
    } catch (err) {
      setFieldErrors(err.fields || {});
      notify('error', err.fields ? Object.values(err.fields).join(' ') : err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveImages = async () => {
    setBusy(true);
    setFieldErrors({});
    try {
      const result = await saveDestinationImages(destinationId, images);
      setImages(result.images.map((img) => ({ ...EMPTY_IMAGE, ...img })));
      notify('ok', `Photographs saved (${result.images.length}).`);
    } catch (err) {
      setFieldErrors(err.fields || {});
      notify('error', err.fields ? Object.values(err.fields).join(' ') : err.message);
    } finally {
      setBusy(false);
    }
  };

  const setImage = (i, changes) => setImages(images.map((img, j) => (j === i ? { ...img, ...changes, srcset: changes.url && changes.url !== img.url ? [] : img.srcset } : img)));
  const moveImage = (i, step) => {
    const next = [...images];
    [next[i], next[i + step]] = [next[i + step], next[i]];
    setImages(next);
  };
  const setFact = (key, changes) => setContent({ ...content, [key]: { ...content[key], ...changes } });

  const visible = destinations.filter((d) => `${d.destinationName} ${d.state}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter destinations" className={`${inputClass} sm:w-64`} />
        <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className={`${inputClass} flex-grow`}>
          {visible.map((d) => (
            <option key={d.destinationId} value={d.destinationId}>
              {d.destinationName} ({d.state}) - {d.imageCount} photo{d.imageCount === 1 ? '' : 's'}
            </option>
          ))}
        </select>
        {destinationId && <Link to={`/destinations/${destinationId}`} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-cyan-300 hover:text-white">View public page</Link>}
      </div>

      {!data || !content ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Content */}
          <div className={`${card} p-5 space-y-4 text-xs`}>
            <h3 className="text-sm font-bold text-white">Information for {data.name}</h3>
            <p className="text-[11px] text-slate-500">
              Only enter facts you have checked. Opening hours and entry fees are shown to tourists only when marked verified with an official source link.
              {data.contentUpdatedAt && ` Last saved ${formatTime(data.contentUpdatedAt)}.`}
            </p>
            {TEXT_FIELDS.map(([key, label, rows]) => (
              <label key={key} className="block">
                <span className="text-slate-300 block mb-1">{label}</span>
                <textarea rows={rows} value={content[key]} onChange={(e) => setContent({ ...content, [key]: e.target.value })} className={`${inputClass} w-full`} />
                {fieldErrors[key] && <span className="text-rose-300">{fieldErrors[key]}</span>}
              </label>
            ))}
            <label className="block">
              <span className="text-slate-300 block mb-1">Expected visit duration (e.g. "2-3 hours")</span>
              <input maxLength={200} value={content.visitDuration} onChange={(e) => setContent({ ...content, visitDuration: e.target.value })} className={`${inputClass} w-full`} />
            </label>

            {[['openingHours', 'Opening hours'], ['entryFees', 'Entry fees']].map(([key, label]) => (
              <fieldset key={key} className="border border-slate-800 rounded-xl p-3 space-y-2">
                <legend className="px-1 text-slate-300">{label}</legend>
                <textarea rows={2} maxLength={500} value={content[key].text} onChange={(e) => setFact(key, { text: e.target.value })} placeholder={`${label} as published officially`} className={`${inputClass} w-full`} />
                <input value={content[key].sourceUrl || ''} onChange={(e) => setFact(key, { sourceUrl: e.target.value })} placeholder="https:// official source (required to verify)" className={`${inputClass} w-full`} />
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={content[key].verified} onChange={(e) => setFact(key, { verified: e.target.checked, verifiedAt: e.target.checked ? new Date().toISOString() : null })} className="accent-amber-500" />
                  Verified - I checked this against the official source
                </label>
                {fieldErrors[key] && <p className="text-rose-300">{fieldErrors[key]}</p>}
                {!content[key].verified && content[key].text && <p className="text-amber-300">Saved as a draft - not shown to tourists until verified.</p>}
              </fieldset>
            ))}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">FAQs (in addition to the automatic ones from the dataset)</span>
                <button type="button" disabled={content.faqs.length >= 15} onClick={() => setContent({ ...content, faqs: [...content.faqs, { question: '', answer: '' }] })} className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-300 flex items-center gap-1 disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {content.faqs.map((faq, i) => (
                <div key={i} className="border border-slate-800 rounded-xl p-2 space-y-1.5">
                  <input value={faq.question} maxLength={200} onChange={(e) => setContent({ ...content, faqs: content.faqs.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)) })} placeholder="Question" className={`${inputClass} w-full`} />
                  <textarea rows={2} value={faq.answer} maxLength={1000} onChange={(e) => setContent({ ...content, faqs: content.faqs.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f)) })} placeholder="Answer" className={`${inputClass} w-full`} />
                  <button type="button" onClick={() => setContent({ ...content, faqs: content.faqs.filter((_, j) => j !== i) })} className="text-rose-300 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                </div>
              ))}
              {fieldErrors.faqs && <p className="text-rose-300">{fieldErrors.faqs}</p>}
            </div>

            <button type="button" onClick={saveContent} disabled={busy} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" /> Save information
            </button>
          </div>

          {/* Photographs */}
          <div className={`${card} p-5 space-y-4 text-xs`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Photographs ({images.length}/{data.maxImages})</h3>
              <button type="button" disabled={images.length >= data.maxImages} onClick={() => setImages([...images, { ...EMPTY_IMAGE }])} className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-300 flex items-center gap-1 disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" /> Add photo
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Use only photos you are allowed to publish (your own, or freely licensed e.g. on Wikimedia Commons) and fill in the credit and licence.
              The first photo is used on the destination card. Image links must start with https://.
            </p>
            {images.length === 0 && <p className="text-slate-400">No photographs yet - tourists see a placeholder.</p>}
            {images.map((img, i) => (
              <div key={i} className="border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-950">
                  <DestinationImage image={img.url ? img : null} name={data.name} id={data.id} sizes="400px" />
                </div>
                <input value={img.url} onChange={(e) => setImage(i, { url: e.target.value })} placeholder="https:// image URL" className={`${inputClass} w-full`} />
                <input value={img.alt} maxLength={200} onChange={(e) => setImage(i, { alt: e.target.value })} placeholder="Alt text: what the photo shows" className={`${inputClass} w-full`} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={img.credit} maxLength={200} onChange={(e) => setImage(i, { credit: e.target.value })} placeholder="Photographer / credit" className={inputClass} />
                  <input value={img.license} maxLength={100} onChange={(e) => setImage(i, { license: e.target.value })} placeholder="Licence (e.g. CC BY-SA 4.0)" className={inputClass} />
                  <input value={img.licenseUrl || ''} onChange={(e) => setImage(i, { licenseUrl: e.target.value })} placeholder="https:// licence link (optional)" className={inputClass} />
                  <input value={img.sourceUrl || ''} onChange={(e) => setImage(i, { sourceUrl: e.target.value })} placeholder="https:// source page (optional)" className={inputClass} />
                </div>
                {img.url && <ImageCredit image={img} />}
                {fieldErrors[`image${i + 1}`] && <p className="text-rose-300">{fieldErrors[`image${i + 1}`]}</p>}
                <div className="flex gap-3">
                  <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)} className="text-slate-300 flex items-center gap-1 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /> Up</button>
                  <button type="button" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} className="text-slate-300 flex items-center gap-1 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /> Down</button>
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-rose-300 flex items-center gap-1 ml-auto"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                </div>
              </div>
            ))}
            {fieldErrors.images && <p className="text-rose-300">{fieldErrors.images}</p>}
            <button type="button" onClick={saveImages} disabled={busy} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" /> Save photographs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Crowd
function Crowd() {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    fetchCrowdOverview().then(setRows).catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorBox text={error} />;
  if (!rows) return <Loading />;

  const order = { HIGH: 0, MODERATE: 1, LOW: 2 };
  const visible = rows
    .filter((r) => `${r.destinationName} ${r.state}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => order[a.crowdLevel] - order[b.crowdLevel] || b.peopleWaiting - a.peopleWaiting);

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="p-4 border-b border-slate-800 space-y-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by destination or state" className={`${inputClass} w-full`} />
        <p className="text-[10px] text-slate-500">{rows[0]?.dataSource}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="text-slate-500 text-[11px] uppercase">
            <tr className="border-b border-slate-800">
              <th className="text-left px-5 py-2">Destination</th><th className="text-left px-3 py-2">Level</th><th className="text-left px-3 py-2">Season</th>
              <th className="text-right px-3 py-2">Waiting</th><th className="text-right px-3 py-2">Inside</th><th className="text-right px-3 py-2">Est. wait</th><th className="text-right px-5 py-2">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.destinationId} className="border-b border-slate-800/60 text-slate-300">
                <td className="px-5 py-2"><Link to={`/destinations/${r.destinationId}`} className="hover:text-cyan-300">{r.destinationName}</Link><span className="text-slate-500"> • {r.state}</span></td>
                <td className="px-3 py-2"><CrowdBadge level={r.crowdLevel} size="sm" /></td>
                <td className="px-3 py-2 text-slate-400">{r.season}</td>
                <td className="px-3 py-2 text-right text-cyan-300">{r.peopleWaiting}</td>
                <td className="px-3 py-2 text-right text-emerald-300">{r.peopleInside}</td>
                <td className="px-3 py-2 text-right">~{r.estimatedWaitMinutes}m</td>
                <td className="px-5 py-2 text-right text-slate-500">{r.lastActivityAt ? formatTime(r.lastActivityAt) : 'none'}{r.lastActivityAt && r.isStale ? ' (stale)' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Audit log
const AUDIT_ACTIONS = [
  '', 'booking.created', 'booking.checked_in', 'booking.checked_in_override', 'booking.checked_out', 'booking.no_show', 'booking.cancelled',
  'booking.cancelled_by_admin', 'destination.settings_updated', 'destination.content_updated', 'destination.images_updated',
  'destination.images_imported', 'auth.admin_login', 'auth.admin_login_failed', 'auth.password_changed', 'admin.account_created', 'data.imported_from_json',
];

function AuditLog() {
  const [filters, setFilters] = useState({ action: '', actor: '', target: '' });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (before = '') => {
      try {
        const page = await fetchAuditLog({ ...filters, before });
        setRows((prev) => (before ? [...(prev || []), ...page] : page));
        setHasMore(page.length === 100);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    },
    [filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
        <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className={inputClass}>
          {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{a || 'All actions'}</option>)}
        </select>
        <input value={filters.actor} onChange={(e) => setFilters({ ...filters, actor: e.target.value })} placeholder="Actor email" className={`${inputClass} flex-grow`} />
        <input value={filters.target} onChange={(e) => setFilters({ ...filters, target: e.target.value.toUpperCase() })} placeholder="Booking ID / destination ID" className={`${inputClass} flex-grow`} />
      </div>
      <p className="px-5 py-2 text-[10px] text-slate-500 border-b border-slate-800">Append-only: entries cannot be edited or deleted, not even by admins (enforced by the database).</p>
      {error && <ErrorBox text={error} />}
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <p className="p-8 text-center text-xs text-slate-400">No entries.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="text-slate-500 text-[11px] uppercase">
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-2">Time</th><th className="text-left px-3 py-2">Action</th><th className="text-left px-3 py-2">Actor</th>
                <th className="text-left px-3 py-2">Target</th><th className="text-left px-5 py-2">Reason / details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-b border-slate-800/60 align-top ${r.action.includes('override') ? 'bg-amber-500/5' : ''}`}>
                  <td className="px-5 py-2 text-slate-400 whitespace-nowrap">{formatTime(r.at)}</td>
                  <td className={`px-3 py-2 ${r.action.includes('override') || r.action.includes('failed') ? 'text-amber-300' : 'text-cyan-300'}`}>{r.action}</td>
                  <td className="px-3 py-2 text-slate-300">{r.actorEmail || 'system'}{r.actorRole && <span className="block text-[10px] text-slate-500">{r.actorRole}</span>}</td>
                  <td className="px-3 py-2 text-slate-300">{r.targetId || '-'}</td>
                  <td className="px-5 py-2 text-slate-400 max-w-md">
                    {r.reason && <span className="block text-slate-200">"{r.reason}"</span>}
                    <span className="block text-[10px] break-all">{Object.entries(r.details || {}).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' • ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasMore && (
        <div className="p-3 text-center">
          <button onClick={() => load(rows[rows.length - 1].id)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-200 hover:bg-slate-700">Load older entries</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- shared pieces
function BookingTable({ bookings, onAction, showDestination = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead className="text-slate-500 text-[11px] uppercase">
          <tr className="border-b border-slate-800">
            <th className="text-left px-5 py-2">Pos.</th>
            <th className="text-left px-3 py-2">Booking</th>
            {showDestination && <th className="text-left px-3 py-2">Destination</th>}
            <th className="text-left px-3 py-2">Tourist</th>
            <th className="text-left px-3 py-2">People</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-right px-5 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.bookingId} className="border-b border-slate-800/60 text-slate-300 align-middle">
              <td className="px-5 py-2.5 text-amber-400 font-bold">{b.queuePosition ?? '-'}</td>
              <td className="px-3 py-2.5 text-cyan-300">{b.bookingId}<span className="block text-[10px] text-slate-500">{formatTime(b.createdAt)}</span></td>
              {showDestination && <td className="px-3 py-2.5">{b.destinationName}</td>}
              <td className="px-3 py-2.5">{b.user?.name}<span className="block text-[10px] text-slate-500">{b.user?.email}</span></td>
              <td className="px-3 py-2.5">{b.numberOfPeople}</td>
              <td className="px-3 py-2.5">
                <QueueStatus status={b.status} size="sm" />
                {b.endedReason && <span className="block text-[10px] text-slate-500 mt-1 max-w-[12rem] truncate" title={b.endedReason}>{b.endedReason}</span>}
              </td>
              <td className="px-5 py-2.5 text-right">
                <ActionButtons booking={b} isFront={b.queuePosition === 1} onAction={(kind) => onAction(b, kind)} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Only actions allowed for the current status are shown.
 * FIFO: normal check-in / no-show only for the front of the queue;
 * any other waiting group needs an override with a reason.
 */
function ActionButtons({ booking, isFront, onAction, compact = false }) {
  const size = compact ? 'px-2.5 py-1' : 'px-4 py-2';
  const base = `${size} inline-flex items-center gap-1 rounded-lg border`;
  if (booking.status === 'WAITING') {
    return (
      <span className="inline-flex gap-2 whitespace-nowrap flex-wrap justify-end">
        {isFront ? (
          <>
            <button onClick={() => onAction('check-in')} className={`${base} bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25`}>
              <LogIn className="w-3.5 h-3.5" /> Check in
            </button>
            <button onClick={() => onAction('no-show')} className={`${base} bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20`}>
              <UserX className="w-3.5 h-3.5" /> No-show
            </button>
          </>
        ) : (
          <button onClick={() => onAction('override')} title="Not at the front of the queue" className={`${base} bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-slate-700`}>
            <ShieldAlert className="w-3.5 h-3.5" /> Override check-in
          </button>
        )}
        <button onClick={() => onAction('cancel')} className={`${base} bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20`}>
          <XCircle className="w-3.5 h-3.5" /> Cancel
        </button>
      </span>
    );
  }
  if (booking.status === 'CHECKED_IN') {
    return (
      <button onClick={() => onAction('check-out')} className={`${base} bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25 whitespace-nowrap`}>
        <LogOut className="w-3.5 h-3.5" /> Check out
      </button>
    );
  }
  return <span className="text-slate-500">no actions</span>;
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-slate-500 block text-[10px] uppercase">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}

const Loading = () => <p className="p-8 text-center text-xs font-mono text-slate-400">Loading...</p>;
const ErrorBox = ({ text }) => <div className="p-4 m-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{text}</div>;
