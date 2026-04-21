import { useState } from 'react';
import HlsPlayer from '../components/HlsPlayer.jsx';
import { api } from '../api/client.js';

export default function TestStreamPage() {
  const [streamKey, setStreamKey] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const data = await api(`/api/streams/status/${streamKey}`);
      setStatus(data);
    } catch (err) {
      setStatus(null);
      setError(err.message);
    }
  };

  const hlsUrl = status ? `${status.hlsUrl}` : '';

  return (
    <section className="card">
      <h2>Test Stream</h2>
      <p>Paste a stream key to validate live status and preview the HLS playback.</p>
      <div className="row">
        <input value={streamKey} onChange={(e) => setStreamKey(e.target.value)} placeholder="example123" />
        <button onClick={load}>Check</button>
      </div>
      {error && <p className="error">{error}</p>}
      {status && (
        <>
          <p>Status: {status.isLive ? 'Live' : 'Offline'}</p>
          <p>Debug URL: {hlsUrl}</p>
          {status.isLive ? <HlsPlayer url={hlsUrl} /> : <p>Stream is currently offline.</p>}
        </>
      )}
    </section>
  );
}
