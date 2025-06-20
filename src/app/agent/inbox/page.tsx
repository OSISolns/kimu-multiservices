import { FaInbox } from 'react-icons/fa'

export default function Inbox() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center mb-6">
        <FaInbox className="text-6xl text-blue-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Inbox</h1>
      </div>
      <p className="text-gray-600 mb-8 text-lg">Check your messages and notifications here.<br /><span className="font-semibold text-blue-600">More coming soon!</span></p>
      <button className="bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-60" disabled>
        View Inbox
      </button>
    </div>
  );
} 