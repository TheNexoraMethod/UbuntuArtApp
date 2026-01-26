"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = "/account/signin";
  };

  const handleSignUp = () => {
    window.location.href = "/account/signup";
  };

  const handleBookNow = () => {
    window.location.href = "/booking";
  };

  const handleArtistApplication = () => {
    window.location.href = "/application";
  };

  return (
    <div className="min-h-screen bg-[#F0F9F4]">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-[#D1E7DD]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#166534]">
              Ubuntu Art Village
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBookNow}
                className="px-4 py-2 bg-[#166534] text-white rounded-lg hover:bg-[#15803D] transition cursor-pointer border-none"
              >
                Book Now
              </button>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-[#374151] hover:text-[#166534] transition cursor-pointer border-none bg-transparent"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition shadow-sm cursor-pointer border-none"
              >
                Create an Account
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#166534] mb-6">
            Welcome to Ubuntu Art Village
          </h2>
          <p className="text-xl text-[#374151] mb-8 max-w-3xl mx-auto">
            A creative community space where artists thrive. Book your
            residency, connect with fellow creators, and bring your artistic
            vision to life in our inspiring environment.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={handleBookNow}
              className="px-10 py-4 bg-[#F59E0B] text-white font-semibold text-lg rounded-lg hover:bg-[#D97706] transition shadow-lg cursor-pointer border-none"
            >
              Book Your Stay
            </button>
            <button
              onClick={handleArtistApplication}
              className="px-10 py-4 bg-[#166534] text-white font-semibold text-lg rounded-lg hover:bg-[#15803D] transition shadow-lg cursor-pointer border-none"
            >
              Apply for Residency
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD] hover:shadow-md transition text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-[#166534] mb-3">
              Artist Residencies
            </h3>
            <p className="text-[#6B7280]">
              Immersive creative programs with workspace, accommodation, and
              community
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD] hover:shadow-md transition text-center">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-[#166534] mb-3">
              Guest Accommodation
            </h3>
            <p className="text-[#6B7280]">
              Comfortable rooms in a creative environment for visitors and
              travelers
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD] hover:shadow-md transition text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-[#166534] mb-3">
              Flexible Booking
            </h3>
            <p className="text-[#6B7280]">
              1-6 month artist residencies with transparent pricing. Check-in:
              3:00 PM, Check-out: 12:00 PM
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD] hover:shadow-md transition text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-[#166534] mb-3">
              Global Community
            </h3>
            <p className="text-[#6B7280]">
              Connect with artists from around the world in our creative village
            </p>
          </div>
        </div>

        {/* Room Types */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-[#166534] text-center mb-8">
            Choose Your Creative Space
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-[#166534] text-lg">Loading rooms...</div>
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-sm border border-[#D1E7DD] overflow-hidden hover:shadow-md transition"
                >
                  {/* Room Image */}
                  {room.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={room.image_url}
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h4 className="text-2xl font-semibold text-[#166534] mb-3">
                      {room.title}
                    </h4>
                    <p className="text-[#6B7280] mb-4">
                      {room.description ||
                        "Comfortable creative space with amenities"}
                    </p>

                    {room.pricing_config?.price_per_night && (
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-[#166534] mb-2">
                          ${room.pricing_config.price_per_night}
                          <span className="text-lg font-normal">/night</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBookNow}
                      className={`w-full px-4 py-2 text-white rounded-lg transition cursor-pointer border-none ${
                        index % 2 === 0
                          ? "bg-[#F59E0B] hover:bg-[#D97706]"
                          : "bg-[#166534] hover:bg-[#15803D]"
                      }`}
                    >
                      Book {room.title}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#6B7280] text-lg">
                Check back soon for available rooms!
              </p>
            </div>
          )}
        </div>

        {/* Artist Residency CTA */}
        <div className="bg-gradient-to-r from-[#166534] to-[#15803D] rounded-lg p-8 mb-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Artist Community?
          </h3>
          <p className="text-[#E5F7EC] text-lg mb-6 max-w-2xl mx-auto">
            Apply for our artist residency program and immerse yourself in a
            supportive creative environment. Work on your projects, collaborate
            with other artists, and grow your practice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleArtistApplication}
              className="px-8 py-3 bg-white text-[#166534] font-semibold rounded-lg hover:bg-gray-100 transition cursor-pointer border-none"
            >
              Apply for Residency
            </button>
            <button
              onClick={handleBookNow}
              className="px-8 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-[#D97706] transition cursor-pointer border-none"
            >
              Book as Guest
            </button>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h4 className="text-lg font-semibold text-[#166534] mb-2">
              Transparent Pricing
            </h4>
            <p className="text-[#6B7280]">
              No hidden fees. Extra guest option available for $20/night
              including breakfast.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h4 className="text-lg font-semibold text-[#166534] mb-2">
              Secure Booking
            </h4>
            <p className="text-[#6B7280]">
              Safe and secure online payments with instant confirmation and
              email receipts.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📞</span>
            </div>
            <h4 className="text-lg font-semibold text-[#166534] mb-2">
              24/7 Support
            </h4>
            <p className="text-[#6B7280]">
              Our team is always here to help with your booking or during your
              stay.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#166534] text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Ubuntu Art Village</h3>
              <p className="text-[#DCFCE7]">
                A creative community for artists, makers, and dreamers. Join us
                and bring your artistic vision to life.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={handleBookNow}
                  className="block text-[#DCFCE7] hover:text-white transition cursor-pointer bg-transparent border-none p-0"
                >
                  Book a Stay
                </button>
                <button
                  onClick={handleArtistApplication}
                  className="block text-[#DCFCE7] hover:text-white transition cursor-pointer bg-transparent border-none p-0"
                >
                  Artist Application
                </button>
                <a
                  href="/contact"
                  className="block text-[#DCFCE7] hover:text-white transition"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-[#DCFCE7]">
                <p>Email: hello@ubuntuartvillage.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>123 Art Street, Creative District</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[#15803D] mt-8 pt-8 text-center text-[#DCFCE7]">
            <p>© 2024 Ubuntu Art Village - A creative community for artists</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
