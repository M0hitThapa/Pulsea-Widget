"use client";

import { useState, useEffect, useRef } from "react";
import * as React from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent } from "./ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  X,
  Star,
  CheckCircle2,
  Send,
  Loader2,
  Bug,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Placeholder Functions (for demonstration) ---
const uploadFile = async (bucket, fileName, file) => {
  console.log(`Simulating file upload to ${bucket}/${fileName}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return `https://mockurl.com/${fileName}`;
};

const supabase = {
  rpc: async (func, data) => {
    console.log(`Simulating supabase RPC call: ${func}`, data);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { data: { message: "Feedback submitted" }, error: null };
  },
};

// --- Constants ---
const CLOSED_SIZE = 56;
const HOVER_WIDTH = 150;
const DESKTOP_WIDTH = 400;
const DESKTOP_HEIGHT = 630;

// --- Helper Icon ---
const MessageSquareIcon = (props) => (
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
    className="icon icon-tabler icons-tabler-outline icon-tabler-message-2-share"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 9h8" />
    <path d="M8 13h6" />
    <path d="M12 21l-3 -3h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6" />
    <path d="M16 22l5 -5" />
    <path d="M21 21.5v-4.5h-4.5" />
  </svg>
);

// --- useClickOutside Hook ---
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// --- Main Widget Component ---
export const Widget = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const widgetRef = useRef(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (open) setIsHovered(false);
  }, [open]);

  // Close widget when clicking outside on desktop
  useClickOutside(widgetRef, () => {
    if (open && !isMobile) {
      setOpen(false);
    }
  });

  const onSelectStar = (index) => setRating(index + 1);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
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
    setSubmitted(false);

    try {
      const form = e.target;
      let imageUrl = null;

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

      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setImageFile(null);
        setImagePreview(null);
        form.reset();
        setOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formContent = (
    <div className="flex flex-col h-full space-y-4">
      <DrawerHeader className="pt-6 pb-2 flex w-full items-center justify-between px-6">
        <div className="flex items-center justify-between w-full">
          <div>
            <DrawerTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Share Your Thoughts
            </DrawerTitle>
            <DrawerDescription className="text-sm text-neutral-500 dark:text-neutral-400">
              We&apos;d love to hear from you.
            </DrawerDescription>
          </div>
          {!isMobile && open && (
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          )}
        </div>
      </DrawerHeader>

      {submitted ? (
        <motion.div
          key="success-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-1 flex-col items-center justify-center text-center px-6 min-h-[300px]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.div>
          <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Thanks!
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your {activeTab} helps us grow.
          </p>
        </motion.div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v)}
          className="flex flex-col flex-1 min-h-0 px-6 pb-6"
        >
          <div className="grid w-full grid-cols-2 p-1 mb-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 sticky top-0 z-10">
            <TabTrigger
              value="feedback"
              activeTab={activeTab}
              onClick={() => setActiveTab("feedback")}
              icon={MessageSquare}
              label="Feedback"
            />
            <TabTrigger
              value="bug"
              activeTab={activeTab}
              onClick={() => setActiveTab("bug")}
              icon={Bug}
              label="Bug Report"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0"
            >
              <TabsContent value={activeTab} className="mt-0 space-y-3">
                <div className="space-y-3">
                  <FormFields
                    rating={rating}
                    hoveredStar={hoveredStar}
                    setHoveredStar={setHoveredStar}
                    onSelectStar={onSelectStar}
                    imagePreview={imagePreview}
                    removeImage={removeImage}
                    handleImageChange={handleImageChange}
                    uploading={uploading}
                    type={activeTab}
                    onSubmit={submit}
                  />
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      )}
    </div>
  );

  const TriggerButton = (
    <motion.div
      initial={false}
      animate={{
        width: isHovered && !isMobile ? HOVER_WIDTH : CLOSED_SIZE,
        height: CLOSED_SIZE,
        borderRadius: 50,
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 25,
      }}
      onHoverStart={() => !open && !isMobile && setIsHovered(true)}
      onHoverEnd={() => !open && !isMobile && setIsHovered(false)}
      className={cn(
        "relative flex items-center justify-center overflow-hidden transition-colors bg-blue-600 dark:bg-blue-500"
      )}
    >
      <div className="flex items-center gap-3 px-4">
        <MessageSquareIcon className="size-7 font-semibold text-white" />
        <AnimatePresence>
          {isHovered && !isMobile && (
            <motion.span
              initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
              exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap font-semibold text-white overflow-hidden"
            >
              Feedback
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed right-6 bottom-6 flex flex-col items-end pointer-events-none"
        style={{
          zIndex: 2147483647,
          isolation: "isolate",
        }}
      >
        <Drawer open={open} onOpenChange={setOpen}>
          <AnimatePresence>
            {!open && (
              <motion.div
                key="mobile-trigger"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="shadow-2xl rounded-full pointer-events-auto"
                style={{ width: CLOSED_SIZE, height: CLOSED_SIZE }}
              >
                <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
              </motion.div>
            )}
          </AnimatePresence>

          <DrawerContent
            className="min-h-[74vh] max-h-[90vh] bg-white dark:bg-neutral-950"
            style={{ zIndex: 2147483647 }}
          >
            <div className="h-full">{formContent}</div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div
      className="fixed right-6 bottom-6 flex flex-col items-end pointer-events-none z-50"
      style={{
        zIndex: 2147483647,
        isolation: "isolate",
      }}
    >
      <Drawer open={open} onOpenChange={setOpen}>
        <motion.div
          ref={widgetRef}
          layout
          animate={{
            width: open ? DESKTOP_WIDTH : isHovered ? HOVER_WIDTH : CLOSED_SIZE,
            height: open ? DESKTOP_HEIGHT : CLOSED_SIZE,
            borderRadius: open ? 16 : 50,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 25,
          }}
          className={cn(
            "relative shadow-2xl overflow-hidden pointer-events-auto",
            !open && "cursor-pointer",
            open
              ? "bg-white dark:bg-neutral-950"
              : "bg-blue-600 dark:bg-blue-500"
          )}
          onClick={() => !open && setOpen(true)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="form-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="h-full"
              >
                {formContent}
              </motion.div>
            ) : (
              <motion.div
                key="button-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {TriggerButton}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Drawer>
    </div>
  );
};

function TabTrigger({ value, activeTab, onClick, icon: Icon, label }) {
  const isActive = value === activeTab;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "text-neutral-900 dark:text-neutral-50 bg-white dark:bg-neutral-800 shadow-sm"
          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

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
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a mock form object
    const mockForm = {
      name: { value: name },
      email: { value: email },
      feedback: { value: feedback },
      reset: () => {
        setName("");
        setEmail("");
        setFeedback("");
      },
    };
    // Call the parent submit with mock event
    onSubmit({ ...e, target: mockForm, preventDefault: () => {} });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label
            htmlFor="name"
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-sm bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="feedback"
          className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
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
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[80px] h-full resize-none text-sm bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {type === "feedback" ? "Rate Your Experience" : "Severity"}
        </Label>
        <div className="flex justify-center gap-2 py-1">
          {[...Array(5)].map((_, index) => {
            const isActive = (hoveredStar > 0 ? hoveredStar : rating) > index;
            return (
              <motion.button
                whileHover={{ scale: 1.2 }}
                key={index}
                type="button"
                aria-label={`Set rating to ${index + 1}`}
                onMouseEnter={() => setHoveredStar(index + 1)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => onSelectStar(index)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive
                      ? "fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500"
                      : "text-neutral-300 dark:text-neutral-700"
                  )}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
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
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-neutral-50 dark:bg-neutral-900/30"
          >
            <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-500 mb-2" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Click to upload image
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              PNG, JPG up to 5MB
            </span>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
        type="button"
        disabled={uploading}
        onClick={handleSubmit}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit {type === "feedback" ? "Feedback" : "Bug Report"}
            <Send className="w-3 h-3 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
