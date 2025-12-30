"use client";

import { useState, useEffect, useRef } from "react";
import * as React from "react";

import supabase, { uploadFile } from "../supabase";

// --- Helper Icon ---

const MessageIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Star = ({ filled, onClick, onHover }) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onHover}
    className="p-1 focus:outline-none"
  >
    <svg
      className={`w-6 h-6 transition-colors ${
        filled ? "fill-amber-400 text-amber-400" : "text-gray-300"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>
);

const CheckCircle = () => (
  <svg
    className="w-16 h-16 text-green-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path
      d="M9 12l2 2 4-4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const X = ({ onClick }) => (
  <svg
    onClick={onClick}
    className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Upload = () => (
  <svg
    className="h-8 w-8 text-gray-400 mb-2"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const MessageSquare = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Bug = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m8 2 1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
    <path d="M22 13h-4" />
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
);

const Send = () => (
  <svg
    className="w-3 h-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const AlertCircle = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Toast notification component
const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white`}
  >
    {type === "error" && <AlertCircle />}
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2">
      <X onClick={onClose} />
    </button>
  </div>
);

// ============================================
// MAIN WIDGET COMPONENT
// ============================================
export default function Widget({ projectId = "default-project" }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState("feedback");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, toastType = "success") => {
    setToast({ message, type: toastType });
    setTimeout(() => setToast(null), 5000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file", "error");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if exists
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadFile("feedback-images", fileName, imageFile);
      }

      // Prepare data for backend
      const data = {
        p_project_id: projectId,
        p_user_name: name,
        p_user_email: email,
        p_message: message,
        p_rating: rating,
        p_type: type,
        p_image_url: imageUrl,
      };

      // Call Supabase RPC function
      const { data: returnedData, error } = await supabase.rpc(
        "add_feedback",
        data
      );

      if (error) {
        throw error;
      }

      setSubmitted(true);
      showToast(
        `${
          type === "feedback" ? "Feedback" : "Bug report"
        } submitted successfully!`,
        "success"
      );
      console.log("Submitted data:", returnedData);

      // Reset form after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setHoveredStar(0);
        setName("");
        setEmail("");
        setMessage("");
        setImageFile(null);
        setImagePreview(null);
        setOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast("Failed to submit. Please try again.", "error");
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 2147483647,
            isolation: "isolate",
          }}
        >
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl hover:scale-105 transition-all duration-200"
            style={{ border: "none", cursor: "pointer" }}
          >
            <MessageIcon className="w-7 h-7 text-white" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          zIndex: 2147483647,
          isolation: "isolate",
        }}
      >
        <div className="w-96 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Share Your Thoughts
              </h3>
              <p className="text-sm text-gray-500">
                We'd love to hear from you.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X onClick={() => setOpen(false)} />
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
              <div className="mb-4 flex items-center justify-center rounded-full bg-green-100 p-4">
                <CheckCircle />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Thanks!</h3>
              <p className="text-sm text-gray-500">
                Your {type} helps us grow.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-gray-100">
                <button
                  type="button"
                  onClick={() => setType("feedback")}
                  className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    type === "feedback"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MessageSquare />
                  Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setType("bug")}
                  className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    type === "bug"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Bug />
                  Bug Report
                </button>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 block">
                  {type === "feedback" ? "Your Feedback" : "Describe the Bug"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "feedback"
                      ? "Tell us what's on your mind..."
                      : "What went wrong? Please provide details..."
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 block">
                  {type === "feedback" ? "Rate Your Experience" : "Severity"}
                </label>
                <div
                  className="flex justify-center gap-2 py-1"
                  onMouseLeave={() => setHoveredStar(0)}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      filled={(hoveredStar > 0 ? hoveredStar : rating) >= i}
                      onClick={() => setRating(i)}
                      onHover={() => setHoveredStar(i)}
                    />
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 block">
                  {type === "feedback"
                    ? "Screenshot (Optional)"
                    : "Screenshot (Recommended)"}
                </label>
                {imagePreview ? (
                  <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X onClick={removeImage} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50 transition-colors"
                  >
                    <Upload />
                    <span className="text-sm text-gray-500">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 5MB
                    </span>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !name || !email || !message}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit {type === "feedback" ? "Feedback" : "Bug Report"}
                    <Send />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
