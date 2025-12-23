import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import QuestionDisplay from '../components/QuestionDisplay';
import AudioPlayer from '../components/AudioPlayer';
import styles from '../styles/TV.module.css';

const YOUTUBE_VIDEO_ID = 'geygTzDFpfE';
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;

function TV() {
  const { socket, connected, emit } = useSocket();
  const [state, setState] = useState({
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    audio: { track: null, volume: 0.5, playing: false }
  });

  useEffect(() => {
    if (!socket) return;

    const handleStateSync = (newState) => {
      setState(newState);
    };

    socket.on('stateSync', handleStateSync);

    return () => {
      socket.off('stateSync', handleStateSync);
    };
  }, [socket, emit]);

  // Garantir que o vídeo inicie automaticamente ao montar o componente
  useEffect(() => {
    const iframe = document.querySelector('iframe[src*="youtube.com"]');
    if (iframe) {
      // Forçar reload do iframe para garantir autoplay
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  }, []);

  const audioSrc = state.audio.track ? state.audio.track.startsWith('http') 
    ? state.audio.track 
    : `http://${window.location.hostname}:3000${state.audio.track}`
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.videoBackground}>
        <iframe
          key="youtube-background"
          src={YOUTUBE_EMBED_URL}
          className={styles.youtubeVideo}
          frameBorder="0"
          allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
          allowFullScreen
          title="Background Video"
        />
        <div className={styles.videoOverlay}></div>
      </div>

      {!connected && (
        <div className={styles.connectionStatus}>
          <p>Conectando ao servidor...</p>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.questionBox}>
          <QuestionDisplay
            question={state.currentQuestion}
            questionNumber={state.currentIndex + 1}
            totalQuestions={state.totalQuestions}
          />
        </div>
      </div>

      {audioSrc && (
        <AudioPlayer
          src={audioSrc}
          volume={state.audio.volume}
          playing={state.audio.playing}
          loop={true}
        />
      )}
    </div>
  );
}

export default TV;

