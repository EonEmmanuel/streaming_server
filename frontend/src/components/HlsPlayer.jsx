import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsPlayer({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    }
  }, [url]);

  return <video ref={videoRef} controls autoPlay muted className="video" />;
}
