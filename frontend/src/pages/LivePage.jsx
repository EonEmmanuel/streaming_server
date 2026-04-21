import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import HlsPlayer from '../components/HlsPlayer.jsx';

export default function LivePage() {
  const { streamKey } = useParams();
  const [resolved, setResolved] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api(`/api/public/resolve?streamKey=${streamKey}`)
      .then((mapping) => {
        setResolved(mapping);
        return api(`/api/streams/status/${mapping.streamKey}`);
      })
      .then((streamStatus) => setStatus(streamStatus))
      .catch(() => {
        setResolved(null);
        setStatus(null);
      });
  }, [streamKey]);

  if (!resolved || !status) {
    return <p className="card">Stream not found for this URL.</p>;
  }

  if (!status.isLive) {
    return <p className="card">This stream is currently offline.</p>;
  }

  return (
    <section className="card">
      <h2>Live Stream</h2>
      <p>Now playing: {resolved.customSlug || streamKey}</p>
      <HlsPlayer url={resolved.hlsPath} />
    </section>
  );
}
