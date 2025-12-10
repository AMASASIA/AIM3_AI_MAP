import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { AppRoute } from '../types';
import { Mic, Square } from 'lucide-react';

export const VoicePage: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access required to mint memories.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = "gemini-2.5-flash";
        
        const prompt = `
          Analyze this audio memory for a luxury mapping application. 
          Return a JSON object with the following keys:
          - title: A short, evocative, uppercase title (max 3 words).
          - description: A poetic, single-sentence summary of the memory (max 20 words).
          - emotion: One of 'E1' (Passion/Red), 'E2' (Joy/Yellow), 'E3' (Serenity/Blue), 'E4' (Growth/Green), 'E5' (Mystery/Purple).
        `;

        const result = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { mimeType: "audio/webm", data: base64Audio } },
              { text: prompt }
            ]
          },
          config: { responseMimeType: "application/json" }
        });

        const text = result.text;
        if (!text) throw new Error("No response from AI");
        
        const data = JSON.parse(text);
        
        navigate(`${AppRoute.OKE}?id=generated&title=${encodeURIComponent(data.title)}&desc=${encodeURIComponent(data.description)}&emotion=${data.emotion}`);
      };
    } catch (error) {
      console.error("AI Processing Error:", error);
      setProcessing(false);
      alert("Failed to mint memory. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full h-[70vh] flex flex-col items-center justify-center">
      
      <div className="mb-12 text-center">
        <h2 className="font-display text-4xl mb-2 tracking-widest uppercase">Voice Input</h2>
        <p className="font-serif italic text-stone-500">Mint your memory.</p>
      </div>

      <div className="relative">
        {/* Main Mic Button */}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={processing}
          className={`
            relative z-10 w-24 h-24 rounded-full border border-black flex items-center justify-center 
            transition-all duration-500 ease-in-out bg-white
            ${recording ? 'scale-110 border-2 border-red-900' : 'hover:scale-105 hover:shadow-lg'}
            ${processing ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {processing ? (
             <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
          ) : recording ? (
             <Square size={24} fill="currentColor" className="text-red-900 animate-pulse" />
          ) : (
             <Mic size={32} strokeWidth={1} className="text-black" />
          )}
        </button>

        {/* CSS Waveform Animation (Only visible when recording) */}
        {recording && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-red-900/20 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-red-900/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] flex items-center justify-center gap-1 opacity-50">
               {[...Array(20)].map((_, i) => (
                 <div 
                   key={i} 
                   className="w-1 bg-red-900 animate-[pulse_0.5s_ease-in-out_infinite]"
                   style={{ 
                     height: `${Math.random() * 40 + 10}px`,
                     animationDelay: `${i * 0.05}s` 
                   }}
                 ></div>
               ))}
            </div>
          </>
        )}
      </div>

      {/* Status Text */}
      <div className="mt-16 h-8 text-center">
        {recording && (
          <p className="text-xs font-sans font-bold uppercase tracking-[0.3em] animate-pulse text-red-900">Listening...</p>
        )}
        {processing && (
          <p className="text-xs font-sans font-bold uppercase tracking-[0.3em]">Minting OKE Card...</p>
        )}
        {!recording && !processing && (
          <p className="text-xs font-sans text-stone-400 uppercase tracking-[0.2em]">Tap to Record</p>
        )}
      </div>

    </div>
  );
};