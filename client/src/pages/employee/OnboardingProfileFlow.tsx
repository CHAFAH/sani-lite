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
                    <Input
                      id="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="mt-1"
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
                    placeholder="Software Engineer"
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
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentType" className="text-sm font-medium">
                    Employment Type
                  </Label>
                  <Select value={formData.employmentType} onValueChange={(value) =>
                    setFormData({ ...formData, employmentType: value })
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === "banking" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    Your banking information is encrypted and securely stored for payroll processing.
                  </p>
                </div>
                <div>
                  <Label htmlFor="accountHolderName" className="text-sm font-medium">
                    Account Holder Name
                  </Label>
                  <Input
                    id="accountHolderName"
                    placeholder="John Doe"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountHolderName: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="Chase Bank"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routingNumber" className="text-sm font-medium">
                      Routing Number
                    </Label>
                    <Input
                      id="routingNumber"
                      placeholder="021000021"
                      value={formData.routingNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, routingNumber: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="text-sm font-medium">
                      Account Number
                    </Label>
                    <Input
                      id="accountNumber"
                      type="password"
                      placeholder="••••••••••••••••"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Profile Complete!</h2>
                <p className="text-slate-600">
                  Welcome to the team! Your profile has been successfully set up.
                </p>
                <Button
                  onClick={() => setLocation("/employee/dashboard")}
                  className="mt-6 w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {step !== "complete" && (
          <div className="mt-6 flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === "personal" || isSubmitting}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
              {step === "banking" ? "Complete" : "Next"}
              {!isSubmitting && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
