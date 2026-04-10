import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { COUNTRIES } from "@shared/countries";
import {
  Building2, Palette, Globe, CreditCard, Users, Check, Upload, X, Plus, Trash2, ArrowLeft, ArrowRight, Loader2,
} from "lucide-react";

type Step = "info" | "branding" | "domain" | "subscription" | "invite";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Company Info", icon: Building2 },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "domain", label: "Domain", icon: Globe },
  { key: "subscription", label: "Plan", icon: CreditCard },
  { key: "invite", label: "Invite Team", icon: Users },
];

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Education", "Manufacturing",
  "Retail & E-Commerce", "Real Estate", "Consulting", "Legal", "Media & Entertainment",
  "Telecommunications", "Energy & Utilities", "Transportation & Logistics",
  "Agriculture", "Government", "Non-Profit", "Other",
];

export default function CompanyOnboarding() {
  const [step, setStep] = useState<Step>("info");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Company Info
  const [formData, setFormData] = useState({
    name: "", industry: "", size: "", website: "", email: user?.email || "",
    phone: "", country: "", address: "",
  });

  // Step 2: Branding
  const [brandingData, setBrandingData] = useState({
    logoUrl: "", logoPreview: "", primaryColor: "#0D9488", secondaryColor: "#F59E0B",
  });
  const [logoUploading, setLogoUploading] = useState(false);

  // Step 3: Domain
  const [domainData, setDomainData] = useState({ customDomain: "" });

  // Step 4: Subscription
  const [subscriptionData, setSubscriptionData] = useState({ tier: "starter", seats: 10 });

  // Step 5: Invite
  const [invites, setInvites] = useState<{ email: string; role: string }[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState("employee");

  // Mutations
  const createCompanyMut = trpc.company.create.useMutation();
  const updateCompanyMut = trpc.company.update.useMutation();
  const uploadLogoMut = trpc.company.uploadLogo.useMutation();
  const createSubMut = trpc.subscription.create.useMutation();
  const completeOnboardingMut = trpc.company.completeOnboarding.useMutation();
  const createInviteMut = trpc.invitation.create.useMutation();

  const stepIndex = STEPS.findIndex(s => s.key === step);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Logo must be under 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }

    setLogoUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        setBrandingData(prev => ({ ...prev, logoPreview: reader.result as string }));
        if (companyId) {
          const result = await uploadLogoMut.mutateAsync({ logoData: base64, mimeType: file.type });
          setBrandingData(prev => ({ ...prev, logoUrl: result.logoUrl || "" }));
          toast.success("Logo uploaded successfully");
        } else {
          // Store base64 for later upload after company creation
          setBrandingData(prev => ({ ...prev, logoUrl: base64, logoPreview: reader.result as string }));
        }
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload logo");
      setLogoUploading(false);
    }
  }, [companyId, uploadLogoMut]);

  const handleNext = async () => {
    if (step === "info") {
      if (!formData.name.trim()) { toast.error("Company name is required"); return; }
      if (!formData.email.trim()) { toast.error("Company email is required"); return; }
      try {
        if (!companyId) {
          const result = await createCompanyMut.mutateAsync({
            name: formData.name, industry: formData.industry || undefined,
            size: formData.size || undefined, website: formData.website || undefined,
          });
          setCompanyId(result.companyId);
          // Update additional fields
          await updateCompanyMut.mutateAsync({
            email: formData.email, phone: formData.phone || undefined,
            country: formData.country || undefined, address: formData.address || undefined,
          });
        } else {
          await updateCompanyMut.mutateAsync({
            name: formData.name, industry: formData.industry || undefined,
            size: formData.size || undefined, website: formData.website || undefined,
            email: formData.email, phone: formData.phone || undefined,
            country: formData.country || undefined, address: formData.address || undefined,
          });
        }
        setStep("branding");
      } catch { toast.error("Failed to save company info"); }
    } else if (step === "branding") {
      try {
        await updateCompanyMut.mutateAsync({
          primaryColor: brandingData.primaryColor, secondaryColor: brandingData.secondaryColor,
        });
        setStep("domain");
      } catch { toast.error("Failed to save branding"); }
    } else if (step === "domain") {
      try {
        if (domainData.customDomain.trim()) {
          await updateCompanyMut.mutateAsync({ customDomain: domainData.customDomain });
        }
        setStep("subscription");
      } catch { toast.error("Failed to save domain"); }
    } else if (step === "subscription") {
      if (!companyId) return;
      const prices: Record<string, string> = { starter: "99", growth: "299", enterprise: "999" };
      try {
        await createSubMut.mutateAsync({
          companyId, tier: subscriptionData.tier as "starter" | "growth" | "enterprise",
          seats: subscriptionData.seats, price: prices[subscriptionData.tier],
        });
        setStep("invite");
      } catch { toast.error("Failed to create subscription"); }
    }
  };

  const handleBack = () => {
    const idx = stepIndex;
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const addInvite = () => {
    if (!newInviteEmail.trim()) { toast.error("Email is required"); return; }
    if (invites.some(i => i.email === newInviteEmail)) { toast.error("Email already added"); return; }
    setInvites([...invites, { email: newInviteEmail, role: newInviteRole }]);
    setNewInviteEmail("");
    setNewInviteRole("employee");
  };

  const removeInvite = (email: string) => {
    setInvites(invites.filter(i => i.email !== email));
  };

  const handleComplete = async () => {
    try {
      // Send all invitations
      for (const invite of invites) {
        await createInviteMut.mutateAsync({
          email: invite.email,
          role: invite.role as "admin" | "hr_admin" | "manager" | "employee",
        });
      }
      // Complete onboarding
      await completeOnboardingMut.mutateAsync();
      toast.success("Company setup complete! Welcome to SANI.");
      setLocation("/admin/dashboard");
    } catch { toast.error("Failed to complete setup"); }
  };

  const handleSkipInvites = async () => {
    try {
      await completeOnboardingMut.mutateAsync();
      toast.success("Company setup complete! You can invite team members later.");
      setLocation("/admin/dashboard");
    } catch { toast.error("Failed to complete setup"); }
  };

  const isLoading = createCompanyMut.isPending || updateCompanyMut.isPending || uploadLogoMut.isPending || createSubMut.isPending || completeOnboardingMut.isPending;

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
            Set Up Your Company
          </h1>
          <p className="text-gray-500 mt-2">Complete these steps to get your team started on SANI</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isCompleted = i < stepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-teal-600 text-white" : isActive ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-gray-200 text-gray-500"
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${isActive ? "text-teal-700" : isCompleted ? "text-teal-600" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-18px] ${isCompleted ? "bg-teal-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Company Info */}
        {step === "info" && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-teal-600" /> Company Information</CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Company Name *</label>
                  <Input placeholder="Acme Corporation" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Industry</label>
                  <Select value={formData.industry} onValueChange={v => setFormData({ ...formData, industry: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Company Size</label>
                  <Select value={formData.size} onValueChange={v => setFormData({ ...formData, size: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Country</label>
                  <Select value={formData.country} onValueChange={v => setFormData({ ...formData, country: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Company Email *</label>
                  <Input type="email" placeholder="hr@acme.com" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <div className="flex gap-2 mt-1">
                    {selectedCountry && (
                      <span className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600 whitespace-nowrap">
                        {selectedCountry.flag} {selectedCountry.phone}
                      </span>
                    )}
                    <Input placeholder="123 456 7890" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Website</label>
                  <Input placeholder="https://acme.com" value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <Textarea placeholder="123 Business Ave, Suite 100, City, State, ZIP" value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })} className="mt-1" rows={2} />
                </div>
              </div>
              <Button onClick={handleNext} className="w-full bg-teal-600 hover:bg-teal-700 h-11" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Branding */}
        {step === "branding" && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-teal-600" /> Company Branding</CardTitle>
              <CardDescription>Upload your logo and choose brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Company Logo</label>
                <div className="flex items-start gap-6">
                  <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {brandingData.logoPreview ? (
                      <img src={brandingData.logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={logoUploading} className="w-full">
                      {logoUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Logo</>}
                    </Button>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB. Recommended: 512x512px</p>
                    {brandingData.logoPreview && (
                      <Button variant="ghost" size="sm" onClick={() => setBrandingData({ ...brandingData, logoUrl: "", logoPreview: "" })} className="text-red-500 hover:text-red-700 p-0 h-auto">
                        <X className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={brandingData.primaryColor}
                      onChange={e => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                      className="w-14 h-10 rounded-lg cursor-pointer border border-gray-200" />
                    <Input value={brandingData.primaryColor}
                      onChange={e => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                      className="font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={brandingData.secondaryColor}
                      onChange={e => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                      className="w-14 h-10 rounded-lg cursor-pointer border border-gray-200" />
                    <Input value={brandingData.secondaryColor}
                      onChange={e => setBrandingData({ ...brandingData, secondaryColor: e.target.value })}
                      className="font-mono text-sm" />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Preview</p>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
                  {brandingData.logoPreview ? (
                    <img src={brandingData.logoPreview} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: brandingData.primaryColor }}>
                      {formData.name?.[0] || "A"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm" style={{ color: brandingData.primaryColor }}>{formData.name || "Your Company"}</p>
                    <p className="text-xs text-gray-500">Employee OS Platform</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Domain */}
        {step === "domain" && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-teal-600" /> Custom Domain</CardTitle>
              <CardDescription>Set up a custom domain for your company portal (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Custom Domain</label>
                <Input placeholder="hr.acme.com" value={domainData.customDomain}
                  onChange={e => setDomainData({ customDomain: e.target.value })} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">Point a CNAME record to sani.app to activate your custom domain</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm text-teal-800 font-medium">Your default portal URL</p>
                <p className="text-sm text-teal-600 mt-1 font-mono">
                  {formData.name ? formData.name.toLowerCase().replace(/\s+/g, "-") : "your-company"}.sani.app
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Subscription */}
        {step === "subscription" && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-teal-600" /> Choose Your Plan</CardTitle>
              <CardDescription>Select a plan that fits your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: "starter", name: "Starter", price: "$99", seats: "Up to 25", features: ["Core HR", "Payroll", "Time Off", "Basic Reports"] },
                  { tier: "growth", name: "Growth", price: "$299", seats: "Up to 100", features: ["Everything in Starter", "Performance", "Learning", "Benefits", "Advanced Analytics"] },
                  { tier: "enterprise", name: "Enterprise", price: "$999", seats: "Unlimited", features: ["Everything in Growth", "Custom Workflows", "SSO/SAML", "API Access", "Dedicated Support"] },
                ].map(plan => (
                  <div key={plan.tier} onClick={() => setSubscriptionData({ ...subscriptionData, tier: plan.tier })}
                    className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
                      subscriptionData.tier === plan.tier ? "border-teal-600 bg-teal-50/50 shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    {plan.tier === "growth" && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs">Popular</Badge>
                    )}
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <p className="text-sm text-gray-500 mt-1">{plan.seats} seats</p>
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map(f => (
                        <li key={f} className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Number of Seats</label>
                <Input type="number" min="1" value={subscriptionData.seats}
                  onChange={e => setSubscriptionData({ ...subscriptionData, seats: parseInt(e.target.value) || 1 })} className="mt-1 max-w-[200px]" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Invite Team */}
        {step === "invite" && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-teal-600" /> Invite Your Team</CardTitle>
              <CardDescription>Add team members to get started. They'll receive an invitation link to join.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add invite form */}
              <div className="flex gap-2">
                <Input placeholder="colleague@company.com" type="email" value={newInviteEmail}
                  onChange={e => setNewInviteEmail(e.target.value)} className="flex-1"
                  onKeyDown={e => { if (e.key === "Enter") addInvite(); }} />
                <Select value={newInviteRole} onValueChange={setNewInviteRole}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr_admin">HR Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addInvite} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
              </div>

              {/* Invite list */}
              {invites.length > 0 && (
                <div className="border rounded-xl divide-y">
                  {invites.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-sm">
                          {inv.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{inv.email}</p>
                          <Badge variant="secondary" className="text-xs capitalize">{inv.role.replace("_", " ")}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeInvite(inv.email)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {invites.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No invitations added yet</p>
                  <p className="text-xs mt-1">Add email addresses above to invite your team</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1 h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button variant="ghost" onClick={handleSkipInvites} className="h-11 text-gray-500">Skip for now</Button>
                <Button onClick={handleComplete} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={isLoading || invites.length === 0}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <>Send Invites & Complete <Check className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
