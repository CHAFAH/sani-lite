import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CompanyOnboarding() {
  const [step, setStep] = useState<"info" | "branding" | "subscription">("info");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    website: "",
  });
  const [brandingData, setBrandingData] = useState({
    logoUrl: "",
    primaryColor: "#0D9488",
    secondaryColor: "#F59E0B",
    customDomain: "",
  });
  const [subscriptionData, setSubscriptionData] = useState({
    tier: "starter",
    seats: 10,
  });

  const [, setLocation] = useLocation();
  const createCompanyMutation = trpc.company.create.useMutation();
  const updateBrandingMutation = trpc.company.updateBranding.useMutation();
  const createSubscriptionMutation = trpc.subscription.create.useMutation();

  const handleCreateCompany = async () => {
    if (!formData.name) {
      toast.error("Company name is required");
      return;
    }

    try {
      const result = await createCompanyMutation.mutateAsync(formData);
      setCompanyId(result.companyId);
      setStep("branding");
      toast.success("Company created successfully");
    } catch (error) {
      toast.error("Failed to create company");
    }
  };

  const handleUpdateBranding = async () => {
    if (!companyId) return;

    try {
      await updateBrandingMutation.mutateAsync(brandingData);
      setStep("subscription");
      toast.success("Branding updated successfully");
    } catch (error) {
      toast.error("Failed to update branding");
    }
  };

  const handleCreateSubscription = async () => {
    if (!companyId) return;

    const seatPrices: Record<string, string> = {
      starter: "99",
      growth: "299",
      enterprise: "999",
    };

    try {
      await createSubscriptionMutation.mutateAsync({
        companyId,
        tier: subscriptionData.tier as "starter" | "growth" | "enterprise",
        seats: subscriptionData.seats,
        price: seatPrices[subscriptionData.tier],
      });
      toast.success("Subscription created successfully");
      setLocation("/app/dashboard");
    } catch (error) {
      toast.error("Failed to create subscription");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === "info" || step === "branding" || step === "subscription" ? "bg-teal-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === "branding" || step === "subscription" ? "bg-teal-600" : "bg-gray-200"}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === "branding" || step === "subscription" ? "bg-teal-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === "subscription" ? "bg-teal-600" : "bg-gray-200"}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === "subscription" ? "bg-teal-600 text-white" : "bg-gray-200"}`}>
              3
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Company Info</span>
            <span>Branding</span>
            <span>Subscription</span>
          </div>
        </div>

        {/* Step 1: Company Info */}
        {step === "info" && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Tell us about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input
                  placeholder="e.g., Technology, Finance"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company Size</label>
                <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  placeholder="https://acme.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreateCompany} className="w-full bg-teal-600 hover:bg-teal-700" disabled={createCompanyMutation.isPending}>
                {createCompanyMutation.isPending ? "Creating..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Branding */}
        {step === "branding" && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Customize Your Branding</CardTitle>
              <CardDescription>Make SANI look like your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  placeholder="https://cdn.example.com/logo.png"
                  value={brandingData.logoUrl}
                  onChange={(e) => setBrandingData({ ...brandingData, logoUrl: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={brandingData.primaryColor}
                      onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{brandingData.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Secondary Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={brandingData.secondaryColor}
                      onChange={(e) => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{brandingData.secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Custom Domain</label>
                <Input
                  placeholder="acme.sani.app"
                  value={brandingData.customDomain}
                  onChange={(e) => setBrandingData({ ...brandingData, customDomain: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleUpdateBranding} className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={updateBrandingMutation.isPending}>
                  {updateBrandingMutation.isPending ? "Saving..." : "Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Subscription */}
        {step === "subscription" && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>Select a subscription tier based on your team size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subscription Tier</label>
                <Select value={subscriptionData.tier} onValueChange={(value) => setSubscriptionData({ ...subscriptionData, tier: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - $99/month (10 seats)</SelectItem>
                    <SelectItem value="growth">Growth - $299/month (50 seats)</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $999/month (Unlimited seats)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Number of Seats</label>
                <Input
                  type="number"
                  min="1"
                  value={subscriptionData.seats}
                  onChange={(e) => setSubscriptionData({ ...subscriptionData, seats: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">You'll have <span className="font-semibold text-teal-600">{subscriptionData.seats} employee seats</span> available for your team.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("branding")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleCreateSubscription} className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={createSubscriptionMutation.isPending}>
                  {createSubscriptionMutation.isPending ? "Creating..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
