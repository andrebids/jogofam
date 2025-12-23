import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import QuestionDisplay from '../components/QuestionDisplay';
import AudioPlayer from '../components/AudioPlayer';
import styles from '../styles/TV.module.css';

function TV() {
  const { socket, connected, emit } = useSocket();
  const [state, setState] = useState({
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    revealAnswer: false,
    audio: { track: null, volume: 0.5, playing: false }
  });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Verificar se já interagiu antes
    const saved = localStorage.getItem('audioEnabled');
    if (saved === 'true') {
      setAudioEnabled(true);
      setHasInteracted(true);
    }
  }, []);

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

  const handleEnableAudio = () => {
    setAudioEnabled(true);
    setHasInteracted(true);
    localStorage.setItem('audioEnabled', 'true');
    
    // Tentar iniciar áudio
    if (state.audio.track && !state.audio.playing) {
      emit('audio:playPause');
    }
  };

  const audioSrc = state.audio.track ? state.audio.track.startsWith('http') 
    ? state.audio.track 
    : `http://${window.location.hostname}:3000${state.audio.track}`
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.bokeh}></div>
        <div className={styles.bokeh}></div>
        <div className={styles.bokeh}></div>
        <div className={styles.lights}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className={styles.light} style={{
              left: `${(i * 5) % 100}%`,
              animationDelay: `${i * 0.2}s`
            }}></div>
          ))}
        </div>
      </div>

      {!hasInteracted && (
        <div className={styles.audioPrompt}>
          <button onClick={handleEnableAudio} className={styles.enableAudioBtn}>
            🔊 Ativar Som
          </button>
        </div>
      )}

      {!connected && (
        <div className={styles.connectionStatus}>
          <p>Conectando ao servidor...</p>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.questionBox}>
          <QuestionDisplay
            question={state.currentQuestion}
            revealAnswer={state.revealAnswer}
            questionNumber={state.currentIndex + 1}
            totalQuestions={state.totalQuestions}
          />
        </div>
      </div>

      {audioEnabled && audioSrc && (
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

