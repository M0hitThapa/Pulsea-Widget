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

export const Widget = () => {
  const [rating, setRating] = useState(3);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const onSelectStar = (index) => setRating(index + 1);

  const submit = (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      feedback: form.feedback.value,
      rating,
    };
    setSubmitted(true);
    console.log(data);
  };

  return (
    <>
      <div className="widget fixed bottom-4 left-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button">💬 Feedback</Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-[370px] p-4  bg-white/60 backdrop-blur-md"
          >
            <div className="bg-white p-4 shadow-input rounded border-neutral-200">
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
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-title flex gap-2">
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
                        className="text-neutral-700 font-semibold mb-2 block font-title"
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
                        className="text-neutral-700 font-semibold mb-2 block font-title"
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
                      <Label className="text-neutral-700 font-semibold mb-3 block font-title">
                        Rate Your Experience
                      </Label>
                      <div className="flex gap-2 mb-6">
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

                    <Button className="w-full" type="submit">
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
