import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import QuestionDisplay from '../components/QuestionDisplay';
import AudioPlayer from '../components/AudioPlayer';
import styles from '../styles/TV.module.css';

const YOUTUBE_VIDEO_ID = 'geygTzDFpfE';
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0&mute=0`;

function TV() {
  const { socket, connected, emit } = useSocket();
  const navigate = useNavigate();
  const wakeLockRef = useRef(null);
  const activityIntervalRef = useRef(null);
  const [state, setState] = useState({
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    audio: { track: null, volume: 0.5, playing: false },
    selectedElement: null,
    currentAnswer: null,
    gameEnded: false
  });

  useEffect(() => {
    if (!socket) return;

    const handleStateSync = (newState) => {
      setState(newState);
      
      // Navegar para página de final quando o jogo terminar
      if (newState.gameEnded) {
        setTimeout(() => {
          navigate('/game-end');
        }, 2000);
      }
    };

    socket.on('stateSync', handleStateSync);

    return () => {
      socket.off('stateSync', handleStateSync);
    };
  }, [socket, navigate]);

  // Prevenir modo standby da TV
  useEffect(() => {
    let wakeLock = null;

    // Método alternativo: simular atividade periódica
    function startActivitySimulation() {
      // Criar um elemento invisível para simular movimento
      const hiddenDiv = document.createElement('div');
      hiddenDiv.style.position = 'fixed';
      hiddenDiv.style.top = '-9999px';
      hiddenDiv.style.width = '1px';
      hiddenDiv.style.height = '1px';
      document.body.appendChild(hiddenDiv);

      // Simular movimento do cursor a cada 30 segundos
      activityIntervalRef.current = setInterval(() => {
        // Disparar eventos de movimento para manter a página ativa
        const event = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: Math.random() * 10,
          clientY: Math.random() * 10
        });
        document.dispatchEvent(event);
      }, 30000); // A cada 30 segundos

      console.log('✅ Atividade simulada ativada como fallback');
    }

    // Tentar usar Wake Lock API (método moderno)
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = wakeLock;
          console.log('✅ Wake Lock ativado - TV não entrará em standby');
          
          // Reativar wake lock se for liberado (ex: quando o utilizador muda de aba)
          wakeLock.addEventListener('release', () => {
            console.log('⚠️ Wake Lock foi liberado, tentando reativar...');
            requestWakeLock();
          });
        } else {
          // Wake Lock não disponível, usar fallback
          startActivitySimulation();
        }
      } catch (err) {
        console.warn('Wake Lock não disponível:', err);
        // Fallback para método alternativo
        startActivitySimulation();
      }
    }

    // Iniciar prevenção de standby
    requestWakeLock();

    // Cleanup
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLockRef.current = null;
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
        activityIntervalRef.current = null;
      }
    };
  }, []);

  // Reativar wake lock quando a página voltar a estar visível
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            console.log('✅ Wake Lock reativado após página ficar visível');
          }
        } catch (err) {
          console.warn('Erro ao reativar Wake Lock:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
        {/* Sempre mostrar questionBox, mesmo quando não há pergunta */}
        <div className={styles.questionBox}>
          <QuestionDisplay
            question={state.currentQuestion}
            questionNumber={state.currentIndex + 1}
            totalQuestions={state.totalQuestions}
            selectedElement={state.selectedElement}
            currentAnswer={state.currentAnswer}
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

