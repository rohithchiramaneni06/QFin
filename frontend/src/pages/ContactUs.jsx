import Navbar from '../components/Navbar';

function ContactUs() {
  return (
    <>
      <Navbar />
      <div className="bg-gray-950 min-h-screen p-6 text-gray-200">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-indigo-400 mb-4">Contact Us</h2>
          <form className="bg-gray-900 p-6 rounded-lg shadow-md space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Your Message"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full hover:bg-indigo-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ContactUs;
