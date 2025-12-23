import { useEffect, useRef } from 'react';

function AudioPlayer({ src, volume, playing, onPlayPause, onVolumeChange, loop = true }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume || 0.5;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(err => {
          console.error('Erro ao tocar áudio:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);


  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  if (!src) {
    return null;
  }

  return (
    <div style={{ display: 'none' }}>
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        preload="auto"
        onEnded={() => {
          if (loop && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        }}
      />
    </div>
  );
}

export default AudioPlayer;

