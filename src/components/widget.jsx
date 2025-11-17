import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import supabase from "@/supabase";

export const Widget = ({ projectId }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const onSelectStar = (index) => setRating(index + 1);

  const submit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {
      p_project_id: projectId,
      p_user_name: form.name.value,
      p_user_email: form.email.value,
      p_message: form.feedback.value,
      p_rating: rating,
    };

    const { data: returnedData, error } = await supabase.rpc(
      "add_feedback",
      data
    );
    setSubmitted(true);
    console.log(returnedData);
  };

  return (
    <>
      <div className="widget fixed right-8 bottom-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative group">
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="icon icon-tabler icons-tabler-filled icon-tabler-message-2 size-12 text-neutral-900 dark:text-neutal-100"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-2.586l-2.707 2.707a1 1 0 0 1 -1.32 .083l-.094 -.083l-2.708 -2.707h-2.585a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2" />
                </svg>
              </button>
              <span
                className="absolute -top-12 left-[50%] -translate-x-[50%] 
  z-20 origin-left scale-0 px-3 rounded-lg border 
  border-gray-300 bg-white dark:bg-black py-2 text-sm font-bold
  shadow-md transition-all duration-300 ease-in-out 
  group-hover:scale-100"
              >
                Feedback
              </span>
            </div>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-[370px] px-5 py-4 border border-neutral-200 relative bg-white dark:bg-neutral-950 rounded-lg "
          >
            <div className=" relative">
              {submitted ? (
                <div>
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-circle-check text-green-600"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M9 12l2 2l4 -4" />
                    </svg>
                    <h3 className="text-md font-bold text-neutral-900 mb-2 font-title">
                      Your feedback has been received.
                    </h3>
                    <p className="text-base text-neutral-500">
                      Thank you for your feedback
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-1 font-title flex gap-2">
                      Share Your Thoughts
                    </h3>
                    <p className="text-sm text-neutral-500">
                      We&apos;d love to hear what you think about your
                      experience.
                    </p>
                  </div>

                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-neutral-700 font-semibold mb-1 block font-title"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="h-10 border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-md shadow-input "
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-neutral-700 font-semibold mb-1 block font-title"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="h-10 border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-md shadow-input"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="feedback"
                        className="text-neutral-700 font-semibold mb-2 block font-title"
                      >
                        Your Feedback
                      </Label>
                      <Textarea
                        id="feedback"
                        placeholder="Tell us what's on your mind..."
                        className="h-28 border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-md resize-none shadow-input"
                      />
                    </div>

                    <div className="pt-2">
                      <Label className="text-neutral-700 font-semibold mb-2 block font-title">
                        Rate Your Experience
                      </Label>
                      <div className="flex gap-2 mb-3">
                        {[...Array(5)].map((_, index) => {
                          const active =
                            (hoveredStar > 0 ? hoveredStar : rating) > index;
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
                                    : "fill-neutral-50 stroke-neutral-500"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-neutral-900 dark:bg-neutral-100"
                      type="submit"
                    >
                      Submit Feedback
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

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
