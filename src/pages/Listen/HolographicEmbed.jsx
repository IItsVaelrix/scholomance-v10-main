import { useState, useEffect } from "react";

export default function HolographicEmbed({ trackId, color }) {
  const [isReady, setIsReady] = useState(false);
  // Encode the SoundCloud URL for the widget
  const trackUrl = encodeURIComponent(trackId);
  const colorHex = color.replace("#", "");

  useEffect(() => {
    setIsReady(false);
  }, [trackId]);

  return (
    <div className={`holo-panel ${isReady ? "is-ready" : "is-loading"}`}>
      <div className="holo-shimmer" />
      {!isReady && (
        <div className="holo-loading">
          <span className="loading-sigil" aria-hidden="true">⧗</span>
          <span className="loading-text">Tuning aether...</span>
        </div>
      )}
      <div className="holo-panel-inner">
        <iframe
          title="SoundCloud player"
          src={`https://w.soundcloud.com/player/?url=${trackUrl}&color=%23${colorHex}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`}
          allow="autoplay"
          className="holo-embed"
          onLoad={() => setIsReady(true)}
        />
      </div>
      <div className="holo-scanline" />
    </div>
  );
}
