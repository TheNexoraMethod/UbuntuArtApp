"use client";

import { Palette, Coffee, Calendar, Heart, Users, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">About Ubuntu Art Village</h1>
          <p className="text-xl text-green-50 max-w-3xl">
            An independent and transformative visual art residency programme by
            artists for artists
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* About Us Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[#D1E7DD] p-8">
            <h2 className="text-3xl font-bold text-[#F59E0B] mb-6">About Us</h2>
            <div className="space-y-4 text-[#374151] leading-relaxed">
              <p>
                Ubuntu Art Village is an independent and transformative visual
                art residency programme by artists for artists, nestled in the
                picturesque beauty of Zanzibar, Tanzania. Our mission is to
                provide a sanctuary for African artists to foster their
                creativity, expand their horizons, and immerse themselves in a
                rich tapestry of cultural exchange.
              </p>
              <p>
                Ubuntu Art Village is deeply rooted in the concept of Ubuntu,
                which emphasizes interconnectedness, community, and shared
                humanity. Artists here are not just residents; they are part of
                a supportive and collaborative creative community.
              </p>
            </div>

            {/* Quick Facts */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Calendar className="text-[#22C55E]" size={24} />
                <div>
                  <div className="font-semibold text-[#166534]">Duration</div>
                  <div className="text-sm text-[#6B7280]">
                    One-month residencies
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <MapPin className="text-[#22C55E]" size={24} />
                <div>
                  <div className="font-semibold text-[#166534]">Location</div>
                  <div className="text-sm text-[#6B7280]">Bwejuu, Zanzibar</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Users className="text-[#22C55E]" size={24} />
                <div>
                  <div className="font-semibold text-[#166534]">Community</div>
                  <div className="text-sm text-[#6B7280]">
                    African artists & diaspora
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Vision */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[#D1E7DD] p-8">
            <h2 className="text-3xl font-bold text-[#F59E0B] mb-6">
              Our Vision
            </h2>
            <div className="space-y-4 text-[#374151] leading-relaxed">
              <p>
                We envision a world where the vibrant and diverse voices of
                African artists are celebrated, amplified, and nurtured. We
                believe in the power of art to bridge cultures, ignite
                conversations, and inspire change.
              </p>
              <p>
                We are dedicated to empowering emerging, independent and
                established artists, fostering creativity and artistic growth
                while ensuring gatekeeping and elitism become a thing of the
                past in the art industry.
              </p>
            </div>
          </div>
        </div>

        {/* Our Facilities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#166534] text-center mb-12">
            Our Facilities
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Art Studios */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#D1E7DD] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Palette className="text-[#22C55E]" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#166534]">
                  Art Studios
                </h3>
              </div>
              <p className="text-[#374151] leading-relaxed mb-4">
                Explore your creativity in our 3 art studios, custom made how
                you desire for your residency. Each studio is designed to
                inspire and support your artistic vision.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  Custom Setup
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  Natural Light
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  Spacious
                </span>
              </div>
            </div>

            {/* Bar & Lounge */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#D1E7DD] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Coffee className="text-[#F59E0B]" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#166534]">
                  Bar & Lounge
                </h3>
              </div>
              <p className="text-[#374151] leading-relaxed mb-4">
                Join us for a drink in our lounge area - Co working space as
                well as special events on our UTU FRIDAYS.
              </p>
              <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] p-4 rounded-xl border-l-4 border-[#F59E0B]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <span className="font-bold text-[#92400E]">UTU FRIDAYS</span>
                </div>
                <p className="text-sm text-[#92400E]">
                  Weekly community gathering with fellow artists, locals, and
                  creatives. A celebration of art, culture, and connection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#166534] text-center mb-12">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: "One-Month Residency",
                description:
                  "Extended stay for deep creative exploration and engagement",
                color: "#22C55E",
              },
              {
                icon: Heart,
                title: "Comfortable Accommodation",
                description:
                  "Thoughtfully designed spaces in three unique rooms",
                color: "#F59E0B",
              },
              {
                icon: Users,
                title: "Cultural Exchange",
                description: "Meaningful interactions with Tanzanian creatives",
                color: "#16A34A",
              },
              {
                icon: Palette,
                title: "Weekly Stipend",
                description:
                  "Financial support to enable full creative commitment",
                color: "#15803D",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-[#D1E7DD] p-6 hover:shadow-xl transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon color={item.color} size={24} />
                </div>
                <h3 className="font-bold text-[#166534] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Commitment */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#166534] text-center mb-12">
            Our Commitment
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Promote African Art",
                description:
                  "Amplifying voices and talents of African artists on the global stage",
                color: "#F59E0B",
              },
              {
                icon: Palette,
                title: "Sustainability",
                description:
                  "Operating responsibly and contributing positively to the local community",
                color: "#15803D",
              },
              {
                icon: Users,
                title: "Ubuntu Philosophy",
                description:
                  "Facilitating meaningful interactions for rich cultural exchange",
                color: "#16A34A",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-[#D1E7DD] p-6"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon color={item.color} size={28} />
                </div>
                <h3 className="font-bold text-[#166534] text-lg mb-3">
                  {item.title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Become part of a vibrant artistic ecosystem where creativity thrives
            and connections flourish
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/application"
              className="px-8 py-4 bg-white text-[#166534] font-bold rounded-lg hover:bg-green-50 transition-colors"
            >
              Apply for Residency
            </a>
            <a
              href="/booking"
              className="px-8 py-4 bg-[#F59E0B] text-white font-bold rounded-lg hover:bg-[#D97706] transition-colors"
            >
              Book a Stay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
