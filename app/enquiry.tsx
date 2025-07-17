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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-light text-gray-500 uppercase tracking-wider ml-1">
            Inquiry Form
          </h1>
        </div>
      </header>
      <div className="flex justify-center mt-8">
        <form className="bg-white rounded-lg shadow p-8 w-full max-w-xl space-y-6">
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
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-2 rounded font-semibold hover:bg-cyan-700 transition"
            disabled
          >
            Submit (Coming Soon)
          </button>
        </form>
      </div>
    </div>
  );
}
