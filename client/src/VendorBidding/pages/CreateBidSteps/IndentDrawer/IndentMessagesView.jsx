import React, { useState } from 'react';

export default function IndentMessagesView({
  indent,
  activeVendor,
  conversation = [],
  allVendors = [],
  onSendMessage,
  inputText,
  setInputText,
  chatInputRef,
}) {
  const [sendToAll, setSendToAll] = useState(false);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (onSendMessage) {
      onSendMessage({
        indentId: indent.id,
        vendorId: activeVendor?.id,
        text: inputText.trim(),
        sendToAll,
        allVendorIds: allVendors.map(v => v.id),
      });
    }

    setInputText('');
  };

  return (
    <div className="h-full flex flex-col justify-between space-y-4">
      {/* Conversation message feed */}
      <div className="space-y-3">
        {conversation.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Send a message to inquire about rates, delivery schedule, or request document updates from <span className="font-medium text-slate-600">{activeVendor?.name || activeVendor?.label}</span>.
            </p>
          </div>
        ) : (
          conversation.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-1 px-1">
                  {msg.senderName} • {msg.timestamp}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer Input Footer */}
      <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-white space-y-2.5 rounded-xl shadow-sm">
        <div className="relative">
          <textarea
            ref={chatInputRef}
            rows={2}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${activeVendor?.name || activeVendor?.label || 'vendor'} about this indent or its documents...`}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={e => setSendToAll(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
            />
            <span>Send to all {allVendors.length} vendors of this indent</span>
          </label>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
              inputText.trim()
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Send</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
