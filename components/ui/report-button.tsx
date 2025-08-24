"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ReportButtonProps {
  listingId: string;
  listingTitle?: string;
  variant?: "button" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate Content", description: "Contains offensive or inappropriate material" },
  { value: "spam", label: "Spam", description: "Repetitive or unwanted content" },
  { value: "scam", label: "Scam/Fraud", description: "Suspicious or fraudulent activity" },
  { value: "duplicate", label: "Duplicate", description: "Already posted elsewhere" },
  { value: "other", label: "Other", description: "Other violation not listed above" }
];

export function ReportButton({
  listingId,
  listingTitle = "this content",
  variant = "button",
  size = "sm",
  className = ""
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this content.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to report content",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason,
          description: description.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit report');
      }

      toast({
        title: "Report submitted",
        description: "Thank you for reporting this content. We'll review it shortly.",
      });

      // Reset form and close dialog
      setReason("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit report',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm": return "h-8 px-3 text-xs";
      case "lg": return "h-12 px-6 text-base";
      default: return "h-10 px-4 text-sm";
    }
  };

  const triggerButton = variant === "icon" ? (
    <Button
      variant="ghost"
      size="sm"
      className={`${getButtonSize()} ${className}`}
    >
      <Flag className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      variant="outline"
      size={size}
      className={`${className} text-red-600 border-red-200 hover:bg-red-50`}
    >
      <Flag className="h-4 w-4 mr-2" />
      Report
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-red-500" />
            <span>Report Content</span>
          </DialogTitle>
          <DialogDescription>
            Help us keep the platform safe by reporting {listingTitle}.
            All reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    <div>
                      <div className="font-medium">{reasonOption.label}</div>
                      <div className="text-xs text-gray-500">{reasonOption.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Flag className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Important</p>
                <p className="text-yellow-700">
                  False reports may result in action against your account. 
                  Only report content that violates our community guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}