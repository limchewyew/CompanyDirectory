'use client';

import React, { useState } from 'react';

const inquiryTypes = [
  'Company suggestions',
  'Collaboration',
  'Bug reporting',
  'Others',
];

export default function Enquiry() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: inquiryTypes[0],
    message: '',
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending your message...' });

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          query: `Type: ${form.type}\n\n${form.message}`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' });
        setIsSubmitted(true);
        // Reset form
        setForm({
          name: '',
          email: '',
          type: inquiryTypes[0],
          message: '',
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-light text-gray-500 uppercase tracking-wider ml-1"> </h1>
        </div>
      </header>
      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-11/12 mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-3xl text-gray-600">Inquiry Form</p>
            <div />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-8 w-full max-w-xl space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of inquiry</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {inquiryTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave your Message</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Type your message here..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>
          {status.message && (
            <div className={`p-3 rounded ${
              status.type === 'success' ? 'bg-green-100 text-green-700' :
              status.type === 'error' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {status.message}
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full bg-cyan-600 text-white py-2 rounded font-semibold hover:bg-cyan-700 transition ${
              status.type === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={status.type === 'loading'}
          >
            {status.type === 'loading' ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

