import { useEffect, useRef, useState } from 'react';

function AudioPlayer({ src, volume, playing, onPlayPause, onVolumeChange, loop = true }) {
  const audioRef = useRef(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [playError, setPlayError] = useState(false);

  // Detectar interação do usuário na página
  useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        setPlayError(false);
        if (audioRef.current && playing) {
          audioRef.current.play().catch(err => {
            console.error('Erro ao tocar áudio após interação:', err);
          });
        }
      }
    };

    // Adicionar listeners para vários tipos de interação
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [userInteracted, playing]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume || 0.5;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && userInteracted) {
      if (playing) {
        audioRef.current.play().catch(err => {
          console.error('Erro ao tocar áudio:', err);
          setPlayError(true);
        });
      } else {
        audioRef.current.pause();
      }
    } else if (audioRef.current && playing && !userInteracted) {
      // Tentar autoplay, mas se falhar, marcar que precisa de interação
      audioRef.current.play().catch(err => {
        console.warn('Autoplay bloqueado, aguardando interação do usuário:', err);
        setPlayError(true);
      });
    }
  }, [playing, userInteracted]);

  // Tentar autoplay quando src mudar
  useEffect(() => {
    if (audioRef.current && src && playing && userInteracted) {
      audioRef.current.play().catch(err => {
        console.error('Erro ao tocar áudio:', err);
        setPlayError(true);
      });
    }
  }, [src, playing, userInteracted]);

  const handleUserInteraction = () => {
    if (!userInteracted && audioRef.current) {
      setUserInteracted(true);
      setPlayError(false);
      if (playing) {
        audioRef.current.play().catch(err => {
          console.error('Erro ao tocar áudio após interação:', err);
        });
      }
    }
  };


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
    <>
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
      {playError && !userInteracted && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          cursor: 'pointer'
        }} onClick={handleUserInteraction}>
          🔊 Clique para ativar o som
        </div>
      )}
    </>
  );
}

export default AudioPlayer;

