import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Upload, X, Loader2, Bug, MessageSquare } from "lucide-react";
import { uploadFile } from "@/supabase";

import supabase from "@/supabase";

export const Widget = ({ projectId }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onSelectStar = (index) => setRating(index + 1);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
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

  const submit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const form = e.target;
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadFile("feedback-images", fileName, imageFile);
      }

      const data = {
        p_project_id: projectId,
        p_user_name: form.name.value,
        p_user_email: form.email.value,
        p_message: form.feedback.value,
        p_rating: rating,
        p_type: activeTab,
        p_image_url: imageUrl,
      };

      const { data: returnedData, error } = await supabase.rpc(
        "add_feedback",
        data
      );

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast.success(
        `${
          activeTab === "feedback" ? "Feedback" : "Bug report"
        } submitted successfully!`
      );
      console.log(returnedData);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setImageFile(null);
        setImagePreview(null);
        form.reset();
      }, 3000);
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="widget fixed right-8 bottom-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative group">
              <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-2.586l-2.707 2.707a1 1 0 0 1 -1.32 .083l-.094 -.083l-2.708 -2.707h-2.585a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2" />
                </svg>
              </button>
            </div>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-[400px] px-5 py-4 border border-neutral-200 dark:border-neutral-800 relative bg-white dark:bg-neutral-950 rounded-lg"
          >
            <div className="relative">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600 mb-4"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                    <path d="M9 12l2 2l4 -4" />
                  </svg>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 font-title">
                    {activeTab === "feedback" ? "Feedback" : "Bug Report"}{" "}
                    Received!
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Thank you for your{" "}
                    {activeTab === "feedback" ? "feedback" : "bug report"}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1 font-title">
                      Share Your Thoughts
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      We&apos;d love to hear from you
                    </p>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v)}
                    className="mb-2"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="feedback"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Feedback
                      </TabsTrigger>
                      <TabsTrigger
                        value="bug"
                        className="flex items-center gap-2"
                      >
                        <Bug className="h-4 w-4" />
                        Bug Report
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="feedback" className="mt-2">
                      <form onSubmit={submit} className="space-y-2">
                        <FormFields
                          rating={rating}
                          hoveredStar={hoveredStar}
                          setHoveredStar={setHoveredStar}
                          onSelectStar={onSelectStar}
                          imagePreview={imagePreview}
                          removeImage={removeImage}
                          handleImageChange={handleImageChange}
                          uploading={uploading}
                          type="feedback"
                        />
                      </form>
                    </TabsContent>

                    <TabsContent value="bug" className="mt-2">
                      <form onSubmit={submit} className="space-y-2">
                        <FormFields
                          rating={rating}
                          hoveredStar={hoveredStar}
                          setHoveredStar={setHoveredStar}
                          onSelectStar={onSelectStar}
                          imagePreview={imagePreview}
                          removeImage={removeImage}
                          handleImageChange={handleImageChange}
                          uploading={uploading}
                          type="bug"
                        />
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

function FormFields({
  rating,
  hoveredStar,
  setHoveredStar,
  onSelectStar,
  imagePreview,
  removeImage,
  handleImageChange,
  uploading,
  type,
}) {
  return (
    <>
      <div>
        <Label
          htmlFor="name"
          className="text-neutral-700 dark:text-neutral-300 font-semibold mb-1 block font-title"
        >
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          required
          className="h-9 border-neutral-300 dark:border-neutral-700"
        />
      </div>

      <div>
        <Label
          htmlFor="email"
          className="text-neutral-700 dark:text-neutral-300 font-semibold mb-1 block font-title"
        >
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
          className="h-9 border-neutral-300 dark:border-neutral-700"
        />
      </div>

      <div>
        <Label
          htmlFor="feedback"
          className="text-neutral-700 dark:text-neutral-300 font-semibold mb-2 block font-title"
        >
          {type === "feedback" ? "Your Feedback" : "Describe the Bug"}
        </Label>
        <Textarea
          id="feedback"
          name="feedback"
          placeholder={
            type === "feedback"
              ? "Tell us what's on your mind..."
              : "What went wrong? Please provide details..."
          }
          required
          className="h-24 border-neutral-300 dark:border-neutral-700 resize-none"
        />
      </div>

      <div>
        <Label className="text-neutral-700 dark:text-neutral-300 font-semibold mb-2 block font-title">
          {type === "feedback" ? "Rate Your Experience" : "Severity"}
        </Label>
        <div className="flex justify-between mx-12  mb-3">
          {[...Array(5)].map((_, index) => {
            const active = (hoveredStar > 0 ? hoveredStar : rating) > index;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Set rating to ${index + 1}`}
                onMouseEnter={() => setHoveredStar(index + 1)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => onSelectStar(index)}
                className="relative group"
              >
                <StarIcon
                  className={`h-6 w-6 transition-all duration-200 transform group-hover:scale-110 ${
                    active
                      ? "fill-yellow-400 stroke-yellow-500"
                      : "fill-neutral-50 dark:fill-neutral-800 stroke-neutral-500"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-neutral-700 dark:text-neutral-300 font-semibold mb-2 block font-title">
          {type === "feedback"
            ? "Screenshot (Optional)"
            : "Screenshot (Recommended)"}
        </Label>
        {imagePreview ? (
          <div className="relative w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="image"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
          >
            <Upload className="h-8 w-8 text-neutral-400 mb-2" />
            <span className="text-sm text-neutral-500">
              Click to upload image
            </span>
            <span className="text-xs text-neutral-400 mt-1">
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

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        type="submit"
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          `Submit ${type === "feedback" ? "Feedback" : "Bug Report"}`
        )}
      </Button>
    </>
  );
}

function StarIcon(props) {
  return (
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
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
  );
}
