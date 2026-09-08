import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Compass,
  MapPin,
  Bot,
  User,
  Clock,
  RotateCcw,
  HelpCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { SUGGESTED_QUESTIONS, getAIResponse } from '../data/aiResponses';

export default function AIGuide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const destQuery = searchParams.get('dest');

  // Select destination from URL or default to Taj Mahal
  const [selectedDestId, setSelectedDestId] = useState(
    destQuery && DESTINATIONS.some(d => d.id === destQuery)
      ? destQuery
      : DESTINATIONS[0].id
  );

  const selectedDestination = DESTINATIONS.find(d => d.id === selectedDestId) || DESTINATIONS[0];

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I am your TourFlow AI Companion for ${selectedDestination.name}. Ask me anything about its Mughal-period architecture, visiting hours, crowd mitigation tips, or hidden details!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle destination switcher
  const handleDestinationChange = (e) => {
    const newId = e.target.value;
    setSelectedDestId(newId);
    setSearchParams({ dest: newId });

    const newDest = DESTINATIONS.find(d => d.id === newId);
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Switched destination to ${newDest?.name}. I am ready to guide you through this historic location in ${newDest?.location}. What would you like to explore first?`,
        timestamp: 'Just now'
      }
    ]);
  };

  // Send message flow
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate intelligent AI thinking delay
    setTimeout(() => {
      const responseText = getAIResponse(selectedDestId, text);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Conversation refreshed. I'm ready to answer any questions regarding ${selectedDestination.name}.`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">
              CONTEXTUAL COMPANION ENGINE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
            TourFlow AI Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your intelligent companion for every destination.
          </p>
        </div>

        {/* Prototype Disclaimer Badge */}
        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-xl self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>FRONTEND AI PROTOTYPE • GROUNDED RESPONSES</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Destination Context Card & Selector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Destination Selector Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
              Select Active Destination:
            </label>
            <div className="relative">
              <select
                value={selectedDestId}
                onChange={handleDestinationChange}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-3 pr-10 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Destination Snapshot */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                <img
                  src={selectedDestination.imageUrl}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono text-cyan-300">
                  {selectedDestination.coordinates}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{selectedDestination.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedDestination.location}</span>
                </p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {selectedDestination.shortDescription}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Best time:</span>
                <span className="text-amber-300 truncate max-w-[180px]">{selectedDestination.bestTime}</span>
              </div>
            </div>
          </div>

          {/* Suggested Questions Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Suggested Questions:</span>
            </h4>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 text-xs text-slate-300 hover:text-cyan-300 transition-all font-medium"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-[640px]">
          {/* Chat Header */}
          <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  TourFlow Guide Assistant
                </h3>
                <p className="text-[11px] font-mono text-cyan-400">
                  Grounded: {selectedDestination.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              title="Reset Chat"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Message Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAI
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 shadow-sm'
                        : 'bg-cyan-500 text-slate-950 font-medium shadow-md shadow-cyan-950/30'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[10px] font-mono mt-2 ${
                        isAI ? 'text-slate-500' : 'text-slate-900/70'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAI && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1 font-mono font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-cyan-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
                  <span className="ml-1 text-[11px] text-slate-400">Consulting heritage database...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask about ${selectedDestination.name}...`}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-xl py-3 px-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl transition-all font-bold shadow-md shadow-cyan-950"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
