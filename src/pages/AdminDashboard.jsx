import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ScanLine, ClipboardList, ListOrdered, Activity, Users, Ticket, LogIn, LogOut, XCircle, Search, RefreshCw, Save } from 'lucide-react';
import {
  fetchAdminStats,
  fetchAdminBookings,
  lookupBooking,
  updateBookingStatus,
  fetchAdminQueue,
  fetchCrowdOverview,
  updateDestinationSettings,
  fetchDestinations,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import QueueStatus from '../components/QueueStatus';
import CrowdBadge from '../components/CrowdBadge';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'checkin', label: 'Check-in / out', icon: ScanLine },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'queues', label: 'Queues & Settings', icon: ListOrdered },
  { id: 'crowd', label: 'Crowd', icon: Activity },
];

const STATUSES = ['', 'WAITING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
const formatTime = (iso) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-');
const card = 'bg-slate-900/80 border border-slate-800 rounded-2xl';
const inputClass = 'bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400';

/**
 * Admin dashboard. Every request here is checked by the backend
 * (role "admin" from the database), so the page is useless to anyone else.
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [message, setMessage] = useState(null);

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Shared action for check-in / check-out / cancel buttons
  const runAction = async (bookingId, action) => {
    try {
      const booking = await updateBookingStatus(bookingId, action);
      notify('ok', `${booking.bookingId} is now ${booking.status.replace('_', ' ').toLowerCase()}.`);
      return booking;
    } catch (err) {
      notify('error', err.message);
      return null;
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
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Signed in as {user?.name} ({user?.email})</p>
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
        <div className={`p-3 rounded-xl text-xs font-mono border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {message.text}
        </div>
      )}

      {tab === 'overview' && <Overview />}
      {tab === 'checkin' && <CheckIn runAction={runAction} />}
      {tab === 'bookings' && <Bookings runAction={runAction} />}
      {tab === 'queues' && <Queues runAction={runAction} notify={notify} />}
      {tab === 'crowd' && <Crowd />}
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
          Status totals: {stats.waiting} waiting • {stats.checkedIn} checked in • {stats.checkedOut} checked out • {stats.cancelled} cancelled. Updated {formatTime(stats.generatedAt)}.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Check-in
function CheckIn({ runAction }) {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const find = async (e) => {
    e.preventDefault();
    setBooking(null);
    setError('');
    if (!code.trim()) return setError('Enter a booking ID, pass code or the text from the QR code.');
    try {
      setBooking(await lookupBooking(code.trim()));
    } catch (err) {
      setError(err.message);
    }
  };

  const act = async (action) => {
    const updated = await runAction(booking.bookingId, action);
    if (updated) setBooking(updated);
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
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <Detail label="People" value={booking.numberOfPeople} />
            <Detail label="Queue position" value={booking.queuePosition ?? '-'} />
            <Detail label="Ticket no." value={booking.ticketNumber} />
            <Detail label="Pass code" value={booking.pass.code} />
            <Detail label="Booked" value={formatTime(booking.createdAt)} />
            <Detail label="Checked in" value={formatTime(booking.checkedInAt)} />
          </div>
          <ActionButtons booking={booking} onAction={(action) => act(action)} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Bookings
function Bookings({ runAction }) {
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
        <BookingTable bookings={bookings} onAction={async (id, action) => { await runAction(id, action); load(); }} showDestination />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Queues & settings
function Queues({ runAction, notify }) {
  const [destinations, setDestinations] = useState([]);
  const [destinationId, setDestinationId] = useState('');
  const [queue, setQueue] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDestinations()
      .then((list) => {
        const sorted = [...list].sort((a, b) => b.crowd.peopleWaiting + b.crowd.peopleInside - (a.crowd.peopleWaiting + a.crowd.peopleInside) || a.name.localeCompare(b.name));
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
        setSettings({ queueOpen: data.settings.queueOpen, entryRatePerMinute: data.settings.entryRatePerMinute, notice: data.settings.notice });
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [destinationId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateDestinationSettings(destinationId, { ...settings, entryRatePerMinute: Number(settings.entryRatePerMinute) });
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
              <div className="px-5 py-3 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">
                Waiting - FIFO order ({queue.waiting.length})
              </div>
              {queue.waiting.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">No one is waiting.</p>
              ) : (
                <BookingTable bookings={queue.waiting} onAction={async (id, action) => { await runAction(id, action); load(); }} />
              )}
            </div>
            <div className={`${card} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-800 text-xs font-mono uppercase text-slate-400">Checked in now ({queue.inside.length})</div>
              {queue.inside.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">Nobody is checked in.</p>
              ) : (
                <BookingTable bookings={queue.inside} onAction={async (id, action) => { await runAction(id, action); load(); }} />
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className={`${card} p-5 space-y-2 text-xs`}>
              <h3 className="text-sm font-bold text-white mb-2">Crowd estimate</h3>
              <div className="flex justify-between items-center"><span className="text-slate-400">Level</span><CrowdBadge level={queue.crowd.crowdLevel} size="sm" /></div>
              <div className="flex justify-between"><span className="text-slate-400">Season</span><span className="text-slate-200">{queue.crowd.season}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Est. wait for new booking</span><span className="text-emerald-300">~{queue.crowd.estimatedWaitMinutes} min</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Entry rate</span><span className="text-slate-200">{queue.crowd.entryRatePerMinute}/min {queue.crowd.entryRateMeasured ? '(measured)' : '(assumed)'}</span></div>
              <p className="text-[10px] text-slate-500 pt-2">{queue.crowd.dataSource}</p>
            </div>

            <form onSubmit={saveSettings} className={`${card} p-5 space-y-3 text-xs`}>
              <h3 className="text-sm font-bold text-white">Queue settings</h3>
              <label className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Queue open for new bookings</span>
                <input type="checkbox" checked={settings.queueOpen} onChange={(e) => setSettings({ ...settings, queueOpen: e.target.checked })} className="w-4 h-4 accent-amber-500" />
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
              <td className="px-3 py-2.5"><QueueStatus status={b.status} size="sm" /></td>
              <td className="px-5 py-2.5 text-right"><ActionButtons booking={b} onAction={(action) => onAction(b.bookingId, action)} compact /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Only the actions allowed for the current status are shown
function ActionButtons({ booking, onAction, compact = false }) {
  const size = compact ? 'px-2.5 py-1' : 'px-4 py-2';
  if (booking.status === 'WAITING') {
    return (
      <span className="inline-flex gap-2 whitespace-nowrap">
        <button onClick={() => onAction('check-in')} className={`${size} inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25`}>
          <LogIn className="w-3.5 h-3.5" /> Check in
        </button>
        <button onClick={() => window.confirm(`Cancel booking ${booking.bookingId}?`) && onAction('cancel')} className={`${size} inline-flex items-center gap-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20`}>
          <XCircle className="w-3.5 h-3.5" /> Cancel
        </button>
      </span>
    );
  }
  if (booking.status === 'CHECKED_IN') {
    return (
      <button onClick={() => onAction('check-out')} className={`${size} inline-flex items-center gap-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 whitespace-nowrap`}>
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
