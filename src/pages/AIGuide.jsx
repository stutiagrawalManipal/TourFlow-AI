import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Send,
  MapPin,
  Bot,
  User,
  RotateCcw,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { SUGGESTED_QUESTIONS, getAIResponse } from '../data/aiResponses';

export default function AIGuide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const destQuery = searchParams.get('dest');

  const [selectedDestId, setSelectedDestId] = useState(
    destQuery && DESTINATIONS.some(d => d.id === destQuery)
      ? destQuery
      : DESTINATIONS[0].id
  );

  const selectedDestination = DESTINATIONS.find(d => d.id === selectedDestId) || DESTINATIONS[0];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I am your cultural guide companion for ${selectedDestination.name}. Ask me about its architecture, historical background, optimal visiting hours, or crowd avoidance tips.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDestinationChange = (e) => {
    const newId = e.target.value;
    setSelectedDestId(newId);
    setSearchParams({ dest: newId });

    const newDest = DESTINATIONS.find(d => d.id === newId);
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Destination updated to ${newDest?.name} in ${newDest?.location}. What would you like to explore regarding this landmark?`,
        timestamp: 'Just now'
      }
    ]);
  };

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
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Chat refreshed. Ready to answer questions about ${selectedDestination.name}.`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            TourFlow AI Guide
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your intelligent companion for every destination.
          </p>
        </div>

        <span className="text-xs text-slate-400 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-lg self-start md:self-auto">
          Interactive Cultural Companion
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Destination Context & Suggested Prompts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Destination Selector Card */}
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Active destination:
              </label>
              <div className="relative">
                <select
                  value={selectedDestId}
                  onChange={handleDestinationChange}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl py-2.5 pl-3.5 pr-9 text-xs font-medium text-white focus:outline-none focus:border-sky-500 cursor-pointer appearance-none"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                      {d.name} ({d.state})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Landmark Card Thumbnail */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={selectedDestination.imageUrl}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">{selectedDestination.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedDestination.location}</span>
                </p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {selectedDestination.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Suggested questions:</span>
            </h4>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 hover:text-white transition-colors"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-8 bg-[#111827] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm">
          {/* Chat Header */}
          <div className="bg-slate-900 px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Guide Assistant
                </h3>
                <p className="text-xs text-slate-400">
                  Focus: {selectedDestination.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                      isAI
                        ? 'bg-slate-900 border border-white/[0.06] text-slate-200'
                        : 'bg-sky-600 text-white font-normal shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[11px] mt-2 ${
                        isAI ? 'text-slate-500' : 'text-sky-100/75'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAI && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing state */}
            {isTyping && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-white/[0.06] rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-300" />
                  <span className="ml-1">Checking cultural archive...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-slate-900/80 border-t border-white/[0.08]">
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
                className="flex-1 bg-[#111827] border border-white/[0.1] focus:border-sky-500 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl transition-colors font-medium shadow-sm"
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
