import Navbar from '../components/Navbar';

function ContactUs() {
  return (
    <>
      <Navbar />
      <div className="bg-[#121212] min-h-screen text-white font-sans px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Page Title */}
          <h2 className="text-3xl font-bold text-white tracking-wide text-center">
            Contact Us
          </h2>

          {/* Contact Form */}
          <form className="bg-[#1A1A1A] p-6 rounded-xl shadow-md space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
            />
            <textarea
              placeholder="Your Message"
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg h-32 resize-none focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
            />
            <button
              type="submit"
              className="w-full bg-[#1CA65D] text-white py-3 rounded-lg font-semibold hover:bg-[#178e4b] transition duration-300"
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
