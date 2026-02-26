import { useState, useRef } from 'react';
import { Button } from './ui/button';

interface VoiceRecorderProps {
  onComplete: (result: { transcript: string; audioBlob?: Blob }) => void;
  expectedText?: string;
}

export function VoiceRecorder({ onComplete, expectedText }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // Check if Web Speech API is available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert(
          'Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.'
        );
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize MediaRecorder for audio capture (optional - for future use)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Initialize SpeechRecognition
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        console.log('Transcript:', transcriptText);
        setTranscript(transcriptText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        if (event.error === 'no-speech') {
          alert('No se detectó voz. Intenta hablar más cerca del micrófono.');
        } else {
          alert('Error en el reconocimiento de voz. Intenta de nuevo.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        mediaRecorder.stop();

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      recognition.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = () => {
    if (!transcript) {
      alert('Por favor graba tu respuesta primero.');
      return;
    }

    setIsProcessing(true);

    // Create audio blob if available
    const audioBlob =
      audioChunksRef.current.length > 0
        ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
        : undefined;

    onComplete({
      transcript,
      audioBlob,
    });

    // Reset for next exercise
    setTimeout(() => {
      setTranscript('');
      setIsProcessing(false);
      audioChunksRef.current = [];
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Recording Button */}
      <div className="flex flex-col items-center gap-4">
        <Button
          type="button"
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-32 h-32 rounded-full text-4xl ${
            isRecording
              ? 'bg-destructive hover:bg-destructive/90 recording-pulse'
              : 'bg-primary hover:bg-primary/90'
          }`}
          disabled={isProcessing}
        >
          {isRecording ? '🎤' : '🎙️'}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          {isRecording
            ? 'Grabando... Presiona de nuevo para detener'
            : 'Presiona para grabar tu respuesta'}
        </p>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="p-4 bg-accent/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Tu respuesta:</p>
          <p className="font-medium">{transcript}</p>
        </div>
      )}

      {/* Expected Text Hint (for practice) */}
      {expectedText && !transcript && (
        <div className="p-3 bg-muted/50 rounded-lg text-sm text-center">
          <span className="text-muted-foreground">Intenta decir:</span>{' '}
          <span className="font-medium">&quot;{expectedText}&quot;</span>
        </div>
      )}

      {/* Submit Button */}
      {transcript && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setTranscript('');
              audioChunksRef.current = [];
            }}
            disabled={isProcessing || isRecording}
          >
            Grabar de nuevo
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSubmit}
            disabled={isProcessing || isRecording}
          >
            {isProcessing ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      )}
    </div>
  );
}
