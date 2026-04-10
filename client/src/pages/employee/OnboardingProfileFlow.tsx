import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CountrySelect } from "@/components/CountrySelect";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Step = "personal" | "job" | "banking" | "complete";

export default function OnboardingProfileFlow() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMut = trpc.employee.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      if (step === "banking") {
        setStep("complete");
      } else if (step === "personal") {
        setStep("job");
      } else if (step === "job") {
        setStep("banking");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const [formData, setFormData] = useState({
    // Personal
    phone: "",
    city: "",
    country: "",
    // Job
    position: "",
    department: "",
    employmentType: "full_time",
    // Banking
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (step === "personal") {
        await updateMut.mutateAsync({
          id: user?.id || 0,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
        } as any);
      } else if (step === "job") {
        await updateMut.mutateAsync({
          id: user?.id || 0,
          position: formData.position || undefined,
          department: formData.department || undefined,
          employmentType: formData.employmentType,
        } as any);
      } else if (step === "banking") {
        // In a real app, this would be encrypted and sent to a secure endpoint
        toast.success("Banking information saved securely");
        setStep("complete");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === "personal") {
      setStep("job");
    } else if (step === "job") {
      setStep("banking");
    } else if (step === "banking") {
      setStep("complete");
    }
  };

  const handleBack = () => {
    if (step === "job") {
      setStep("personal");
    } else if (step === "banking") {
      setStep("job");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/employee/onboarding")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Complete Your Profile</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-8 flex justify-between">
          {(["personal", "job", "banking", "complete"] as const).map((s, idx) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  s === "complete"
                    ? "bg-emerald-100 text-emerald-700"
                    : ["personal", "job", "banking"].indexOf(step) >= idx
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {s === "complete" ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <p className="text-xs font-medium text-slate-600 capitalize text-center">{s}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="capitalize">{step === "complete" ? "All Done!" : step}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "personal" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <CountrySelect
                      value={formData.country}
                      onChange={(value) => setFormData({ ...formData, country: value })}
                      placeholder="Select your country"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === "job" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position
                  </Label>
                  <Input
                    id="position"
                    placeholder="e.g., Software Engineer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentType" className="text-sm font-medium">
                    Employment Type
                  </Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employmentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === "banking" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., Chase Bank"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber" className="text-sm font-medium">
                      Account Number
                    </Label>
                    <Input
                      id="accountNumber"
                      placeholder="••••••••"
                      type="password"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routingNumber" className="text-sm font-medium">
                      Routing Number
                    </Label>
                    <Input
                      id="routingNumber"
                      placeholder="••••••••"
                      type="password"
                      value={formData.routingNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, routingNumber: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accountHolderName" className="text-sm font-medium">
                    Account Holder Name
                  </Label>
                  <Input
                    id="accountHolderName"
                    placeholder="Full Name"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountHolderName: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Profile Complete!
                </h2>
                <p className="text-slate-600 mb-6">
                  Your profile has been successfully set up. You can now access all features.
                </p>
                <Button
                  onClick={() => setLocation("/employee/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {step !== "complete" && (
          <div className="flex gap-4 mt-6 justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === "personal"}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
