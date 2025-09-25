"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  RadioGroup,
  RadioGroupItem,
  Label,
  Textarea,
} from "@synq/ui/component";
import { Bug } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@synq/ui/utils";

interface FeedbackButtonProps {
  isCollapsed?: boolean;
}

export async function sendFeedback(data: {
  type: "missing" | "bug";
  message: string;
}) {
  const res = await fetch("/api/mail/send-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to send feedback");
  return res.json();
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  isCollapsed,
}) => {
  const [type, setType] = React.useState<"missing" | "bug">("missing");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await sendFeedback({ type, message });
      toast.success("Feedback sent! Thank you.");
      setMessage("");
      setType("missing");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <div className={cn("", { "px-4": !isCollapsed })}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size={isCollapsed ? "icon" : "sm"}
            className="w-full my-4 justify-center font-light"
          >
            <Bug className="w-4 h-4 " /> {isCollapsed ? "" : "Send Feedback"}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Select the type of feedback and describe the issue or suggestion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <RadioGroup
            value={type}
            onValueChange={(val) => setType(val as "missing" | "bug")}
            className="flex flex-col gap-2"
          >
            <Label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="missing" />
              Missing set/card or error
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="bug" />
              Report bug / feature frustration
            </Label>
          </RadioGroup>

          <Textarea
            placeholder="Describe the issue or suggestion..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
