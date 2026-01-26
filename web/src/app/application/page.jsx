"use client";

import { useState, useEffect } from "react";

export default function ApplicationPage() {
  const [user, setUser] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    artistStatement: "",
    portfolio: "",
    resume: "",
    letterOfIntent: "",
    references: "",
    artStyle: "",
    focusWorkGoals: "",
    whyUbuntu: "",
    cvFileUrl: "",
    showReelUrl: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user from localStorage (adjust based on your auth system)
      const userData = JSON.parse(localStorage.getItem("user") || "null");

      if (!userData) {
        window.location.href = "/account/signin?callbackUrl=/application";
        return;
      }

      setUser(userData);

      // Check for existing application
      const applicationResponse = await fetch(
        `/api/applications?userId=${userData.id}&userRole=${userData.user_role || "user"}`,
      );
      const applicationData = await applicationResponse.json();

      if (
        applicationData.applications &&
        applicationData.applications.length > 0
      ) {
        const app = applicationData.applications[0];
        setExistingApplication(app);

        // Pre-populate form with existing data if editing
        setFormData({
          artistStatement: app.artist_statement || "",
          portfolio: app.portfolio || "",
          resume: app.resume || "",
          letterOfIntent: app.letter_of_intent || "",
          references: app.references_info || "",
          artStyle: app.art_style || "",
          focusWorkGoals: app.focus_work_goals || "",
          whyUbuntu: app.why_ubuntu || "",
          cvFileUrl: app.cv_file_url || "",
          showReelUrl: app.show_reel_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = [
      "artistStatement",
      "portfolio",
      "resume",
      "letterOfIntent",
      "references",
      "artStyle",
      "focusWorkGoals",
      "whyUbuntu",
    ];

    for (const field of required) {
      if (!formData[field] || formData[field].trim().length < 10) {
        setError(
          `${field.replace(/([A-Z])/g, " $1").toLowerCase()} must be at least 10 characters long`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = existingApplication ? "PUT" : "POST";
      const payload = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        artistStatement: formData.artistStatement,
        portfolio: formData.portfolio,
        resume: formData.resume,
        letterOfIntent: formData.letterOfIntent,
        references: formData.references,
        artStyle: formData.artStyle,
        focusWorkGoals: formData.focusWorkGoals,
        whyUbuntu: formData.whyUbuntu,
        cvFileUrl: formData.cvFileUrl,
        showReelUrl: formData.showReelUrl,
        ...(existingApplication && { id: existingApplication.id }),
      };

      const response = await fetch("/api/applications", {
        method: endpoint,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);

      // Redirect to booking after a delay
      setTimeout(() => {
        window.location.href = "/booking";
      }, 3000);
    } catch (error) {
      console.error("Application submission error:", error);
      setError(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#166534]"></div>
          <p className="mt-4 text-[#166534] font-medium">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F0F9F4] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#166534] mb-4">
              Application Submitted!
            </h2>
            <p className="text-[#374151] mb-6">
              Your artist residency application has been submitted successfully.
              Our team will review it and get back to you soon.
            </p>
            <p className="text-sm text-[#6B7280] mb-4">
              You can now proceed to book your residency dates.
            </p>
            <div className="flex items-center justify-center space-x-2 text-[#6B7280]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F59E0B]"></div>
              <span className="text-sm">Redirecting to booking...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9F4]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-[#D1E7DD]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1
              className="text-2xl font-bold text-[#166534] cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              Ubuntu Art Village
            </h1>
            <div className="flex space-x-4">
              {user && (
                <span className="text-[#374151]">Welcome, {user.name}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#166534] mb-4">
            {existingApplication
              ? "Update Your Application"
              : "Artist Residency Application"}
          </h2>
          <p className="text-[#374151] text-lg">
            {existingApplication
              ? "Update your artist residency application details below."
              : "Complete this application to be eligible for artist residency bookings at Ubuntu Art Village."}
          </p>
          {existingApplication && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Application Status:</strong>{" "}
                {existingApplication.status}
                {existingApplication.status === "pending" &&
                  " - Under review by our team"}
                {existingApplication.status === "approved" &&
                  " - Approved! You can now book residency dates"}
                {existingApplication.status === "rejected" &&
                  " - Please update your application based on feedback"}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Artist Statement */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              Artist Statement
            </h3>
            <p className="text-sm text-[#6B7280] mb-3">
              Describe your artistic practice, philosophy, and current body of
              work.
            </p>
            <textarea
              value={formData.artistStatement}
              onChange={(e) =>
                handleInputChange("artistStatement", e.target.value)
              }
              rows={6}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="Tell us about your artistic practice and philosophy..."
              required
            />
            <p className="text-xs text-[#6B7280] mt-1">
              {formData.artistStatement.length} characters (minimum 10 required)
            </p>
          </div>

          {/* Art Style */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              What style of art do you do?
            </h3>
            <textarea
              value={formData.artStyle}
              onChange={(e) => handleInputChange("artStyle", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="Describe your artistic medium, style, and techniques..."
              required
            />
          </div>

          {/* Focus and Goals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              What do you want to focus and work on at Ubuntu?
            </h3>
            <textarea
              value={formData.focusWorkGoals}
              onChange={(e) =>
                handleInputChange("focusWorkGoals", e.target.value)
              }
              rows={4}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="Describe your goals and what you hope to accomplish during your residency..."
              required
            />
          </div>

          {/* Why Ubuntu */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              Why did you choose Ubuntu?
            </h3>
            <textarea
              value={formData.whyUbuntu}
              onChange={(e) => handleInputChange("whyUbuntu", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="What draws you to Ubuntu Art Village specifically?"
              required
            />
          </div>

          {/* Portfolio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              Portfolio
            </h3>
            <p className="text-sm text-[#6B7280] mb-3">
              Provide links to your online portfolio, website, or specific works
              that represent your current practice.
            </p>
            <textarea
              value={formData.portfolio}
              onChange={(e) => handleInputChange("portfolio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="Include URLs to your portfolio, Instagram, website, or describe your recent works..."
              required
            />
          </div>

          {/* Resume/CV */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              Resume/CV
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  CV File URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.cvFileUrl}
                  onChange={(e) =>
                    handleInputChange("cvFileUrl", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                  placeholder="https://... (link to your CV file)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Resume Details
                </label>
                <textarea
                  value={formData.resume}
                  onChange={(e) => handleInputChange("resume", e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                  placeholder="Provide your relevant experience, exhibitions, education, awards, etc..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Show Reel */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              Show Reel (optional)
            </h3>
            <input
              type="url"
              value={formData.showReelUrl}
              onChange={(e) => handleInputChange("showReelUrl", e.target.value)}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="https://... (link to your show reel or video portfolio)"
            />
          </div>

          {/* Letter of Intent */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              Letter of Intent
            </h3>
            <p className="text-sm text-[#6B7280] mb-3">
              Explain why you want to participate in this residency and how it
              will benefit your practice.
            </p>
            <textarea
              value={formData.letterOfIntent}
              onChange={(e) =>
                handleInputChange("letterOfIntent", e.target.value)
              }
              rows={5}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="Express your intent and how this residency aligns with your goals..."
              required
            />
          </div>

          {/* References */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <h3 className="text-xl font-semibold text-[#166534] mb-4">
              References
            </h3>
            <p className="text-sm text-[#6B7280] mb-3">
              Provide contact information for 2-3 professional references who
              can speak to your work and character.
            </p>
            <textarea
              value={formData.references}
              onChange={(e) => handleInputChange("references", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
              placeholder="Name, title, relationship, email, phone number for each reference..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#166534]">
                  Ready to Submit?
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Please review all sections before submitting your application.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/booking")}
                  className="px-6 py-3 border border-[#D1E7DD] text-[#374151] rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-[#D97706] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Submitting..."
                    : existingApplication
                      ? "Update Application"
                      : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
