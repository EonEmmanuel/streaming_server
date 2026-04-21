import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [keys, setKeys] = useState([]);
  const [domains, setDomains] = useState([]);
  const [streams, setStreams] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', userId: '', customSlug: '' });
  const [domainForm, setDomainForm] = useState({ domain: '', streamKeyId: '' });

  const authHeader = { Authorization: `Bearer ${token}` };

  const load = async () => {
    const [k, d, s] = await Promise.all([
      api('/api/keys', { headers: authHeader }),
      api('/api/domains', { headers: authHeader }),
      api('/api/streams', { headers: authHeader })
    ]);
    setKeys(k);
    setDomains(d);
    setStreams(s);
    const userMap = [...new Map(k.map((entry) => [entry.user.id, entry.user])).values()];
    setUsers(userMap);
    if (!form.userId && userMap[0]) {
      setForm((prev) => ({ ...prev, userId: userMap[0].id }));
    }
  };

  useEffect(() => {
    load().catch(() => logout());
  }, []);

  const createKey = async (event) => {
    event.preventDefault();
    await api('/api/keys', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(form)
    });
    setForm({ ...form, name: '', customSlug: '' });
    await load();
  };

  const createDomain = async (event) => {
    event.preventDefault();
    await api('/api/domains', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(domainForm)
    });
    setDomainForm({ domain: '', streamKeyId: '' });
    await load();
  };

  return (
    <section>
      <div className="row">
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="grid">
        <form className="card" onSubmit={createKey}>
          <h3>Create Stream Key</h3>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
          <input
            placeholder="Custom slug (optional)"
            value={form.customSlug}
            onChange={(e) => setForm({ ...form, customSlug: e.target.value })}
          />
          <button>Create</button>
        </form>

        <form className="card" onSubmit={createDomain}>
          <h3>Map Custom Domain</h3>
          <input
            placeholder="stream.example.com"
            value={domainForm.domain}
            onChange={(e) => setDomainForm({ ...domainForm, domain: e.target.value })}
            required
          />
          <select
            value={domainForm.streamKeyId}
            onChange={(e) => setDomainForm({ ...domainForm, streamKeyId: e.target.value })}
            required
          >
            <option value="">Select stream key</option>
            {keys.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} ({k.key})
              </option>
            ))}
          </select>
          <button>Assign Domain</button>
        </form>
      </div>

      <div className="card">
        <h3>Stream Keys</h3>
        <ul>
          {keys.map((k) => (
            <li key={k.id}>
              <strong>{k.name}</strong> — key: {k.key} — slug: {k.customSlug || 'none'} — status:{' '}
              {k.streams?.[0]?.isLive ? 'Live' : 'Offline'}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Active Streams</h3>
        <ul>
          {streams.filter((s) => s.isLive).map((s) => (
            <li key={s.id}>
              {s.streamKey.name} ({s.streamKey.key}) viewers: {s.viewerCount}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Domain Mappings</h3>
        <ul>
          {domains.map((d) => (
            <li key={d.id}>
              {d.domain} → {d.streamKey.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
