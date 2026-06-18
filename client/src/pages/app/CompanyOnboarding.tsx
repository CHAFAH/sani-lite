import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { COUNTRIES } from "@shared/countries";
import {
  Building2, Palette, Globe, CreditCard, Users, Check, Upload, X, Plus, Trash2, ArrowLeft, ArrowRight, Loader2, UserPlus, Eye, EyeOff, Lock, Mail,
} from "lucide-react";

type Step = "account" | "info" | "branding" | "domain" | "subscription" | "invite";

const STEPS_UNAUTH: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "account", label: "Account", icon: UserPlus },
  { key: "info", label: "Company Info", icon: Building2 },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "domain", label: "Domain", icon: Globe },
  { key: "subscription", label: "Plan", icon: CreditCard },
  { key: "invite", label: "Invite Team", icon: Users },
];

const STEPS_AUTH: { key: Step; label: string; icon: React.ElementType }[] = [
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
  const { user, loading, refresh } = useAuth();
  const STEPS = user ? STEPS_AUTH : STEPS_UNAUTH;
  const [step, setStep] = useState<Step>(user ? "info" : "account");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account creation state
  const [accountData, setAccountData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  // Step 1: Company Info
  const [formData, setFormData] = useState({
    name: "", industry: "", size: "", website: "", email: "",
    phoneCode: "", phone: "", country: "",
    addressLine1: "", addressLine2: "", street: "", postalCode: "", city: "", region: "",
  });
  const [countrySearch, setCountrySearch] = useState("");
  const [phoneCodeSearch, setPhoneCodeSearch] = useState("");

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
  const utils = trpc.useUtils();
  const uploadLogoMut = trpc.company.uploadLogo.useMutation();
  const createSubMut = trpc.subscription.create.useMutation();
  const completeOnboardingMut = trpc.company.completeOnboarding.useMutation();
  const createInviteMut = trpc.invitation.create.useMutation();

  const stepIndex = STEPS.findIndex(s => s.key === step);

  // Handle account creation
  const handleAccountNext = async () => {
    if (!accountData.name.trim()) { toast.error("Full name is required"); return; }
    if (!accountData.email.trim()) { toast.error("Email is required"); return; }
    if (accountData.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(accountData.password) || !/[a-z]/.test(accountData.password) || !/[0-9]/.test(accountData.password) || !/[^A-Za-z0-9]/.test(accountData.password)) {
      toast.error("Password must include uppercase, lowercase, number, and special character"); return;
    }
    if (accountData.password !== accountData.confirmPassword) { toast.error("Passwords don't match"); return; }

    setAccountLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accountData.email, password: accountData.password, name: accountData.name }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Registration failed"); setAccountLoading(false); return; }
      // Refresh auth state
      await refresh();
      setStep("info");
    } catch {
      toast.error("Something went wrong");
    }
    setAccountLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google?returnPath=/signup";
  };

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
          // Refetch auth so companyProcedure picks up the new companyId
          await utils.auth.me.invalidate();
          // Now update additional fields
          await updateCompanyMut.mutateAsync({
            email: formData.email, phone: formData.phone ? `+${COUNTRIES.find(c => c.code === (formData.phoneCode || formData.country))?.phone || ""} ${formData.phone}` : undefined,
            country: formData.country || undefined, address: [formData.addressLine1, formData.street, formData.addressLine2, formData.postalCode, formData.city, formData.region].filter(Boolean).join(", ") || undefined,
          });
        } else {
          await updateCompanyMut.mutateAsync({
            name: formData.name, industry: formData.industry || undefined,
            size: formData.size || undefined, website: formData.website || undefined,
            email: formData.email, phone: formData.phone ? `+${COUNTRIES.find(c => c.code === (formData.phoneCode || formData.country))?.phone || ""} ${formData.phone}` : undefined,
            country: formData.country || undefined, address: [formData.addressLine1, formData.street, formData.addressLine2, formData.postalCode, formData.city, formData.region].filter(Boolean).join(", ") || undefined,
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
      // Send all invitations and track whether emails were delivered
      let anyFailures = false;
      for (const invite of invites) {
        const res = await createInviteMut.mutateAsync({
          email: invite.email,
          role: invite.role as "admin" | "hr_admin" | "manager" | "employee",
        });
        // server returns { success, invitationId, token, emailSent }
        if (res && (res as any).emailSent === false) anyFailures = true;
      }
      // Invalidate invitation list cache so admin UI sees new invites
      try { await utils.invitation.list.invalidate(); } catch {}

      // Complete onboarding
      await completeOnboardingMut.mutateAsync();
      if (anyFailures) {
        toast.warning("Some invitations were created but email delivery failed. You can resend from Invitations.");
      } else {
        toast.success("Company setup complete! Invitations sent.");
      }
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

  // Auth guards (after all hooks)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

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

        {/* Step 0: Account Creation */}
        {step === "account" && !user && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-teal-600" /> Create Your Account</CardTitle>
              <CardDescription>Set up your admin account to manage your company on SANI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Google option */}
              <button onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span className="text-sm">Continue with Google</span>
              </button>

              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-slate-400">or create with email</span></div></div>

              {/* Email form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Full Name *</label>
                  <Input value={accountData.name} onChange={(e) => setAccountData({ ...accountData, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Work Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={accountData.email} onChange={(e) => setAccountData({ ...accountData, email: e.target.value })} placeholder="you@company.com" className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} value={accountData.password} onChange={(e) => setAccountData({ ...accountData, password: e.target.value })} placeholder="Create a strong password" className="w-full h-11 pl-10 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                {accountData.password.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                    {[
                      { label: "At least 8 characters", met: accountData.password.length >= 8 },
                      { label: "Uppercase letter", met: /[A-Z]/.test(accountData.password) },
                      { label: "Lowercase letter", met: /[a-z]/.test(accountData.password) },
                      { label: "Number", met: /[0-9]/.test(accountData.password) },
                      { label: "Special character", met: /[^A-Za-z0-9]/.test(accountData.password) },
                    ].map((c) => (
                      <div key={c.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${c.met ? "bg-teal-500" : "bg-slate-200"}`}>
                          {c.met && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={c.met ? "text-teal-700" : "text-slate-500"}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} value={accountData.confirmPassword} onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })} placeholder="Re-enter password" className={`w-full h-11 pl-10 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white ${accountData.confirmPassword && accountData.password !== accountData.confirmPassword ? "border-red-300" : "border-slate-200"}`} />
                    {accountData.confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {accountData.password === accountData.confirmPassword ? <Check size={16} className="text-teal-500" /> : <X size={16} className="text-red-400" />}
                      </div>
                    )}
                  </div>
                  {accountData.confirmPassword && accountData.password !== accountData.confirmPassword && <p className="text-xs text-red-500 mt-1">Passwords don't match</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => window.location.href = "/login"} className="flex-1 h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Login</Button>
                <Button onClick={handleAccountNext} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={accountLoading}>
                  {accountLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Company Info */}
        {step === "info" && user && (
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
                  <Select value={formData.country} onValueChange={v => { setFormData({ ...formData, country: v }); setCountrySearch(""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      <div className="px-2 pb-2 sticky top-0 bg-white">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full h-8 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      {COUNTRIES.filter(c => 
                        !countrySearch || c.name.toLowerCase().startsWith(countrySearch.toLowerCase()) || c.code.toLowerCase().startsWith(countrySearch.toLowerCase())
                      ).map(c => (
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
                    <Select value={formData.phoneCode || formData.country} onValueChange={v => setFormData({ ...formData, phoneCode: v })}>
                      <SelectTrigger className="w-[130px] flex-shrink-0">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 pb-2 sticky top-0 bg-white">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={phoneCodeSearch}
                            onChange={(e) => setPhoneCodeSearch(e.target.value)}
                            className="w-full h-7 px-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {COUNTRIES.filter(c =>
                          !phoneCodeSearch || c.name.toLowerCase().startsWith(phoneCodeSearch.toLowerCase()) || c.phone.includes(phoneCodeSearch.replace("+", "")) || `+${c.phone}`.includes(phoneCodeSearch)
                        ).map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.flag} {c.name} (+{c.phone})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="123 456 7890" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Website</label>
                  <Input placeholder="https://acme.com" value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })} className="mt-1" />
                </div>

                {/* Full Address */}
                <div className="md:col-span-2 space-y-3 pt-2 border-t border-slate-100">
                  <label className="text-sm font-semibold text-gray-700">Company Address</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">House / Apartment / Floor</label>
                      <Input placeholder="Apt 4B, 3rd Floor" value={formData.addressLine1}
                        onChange={e => setFormData({ ...formData, addressLine1: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Street & Number</label>
                      <Input placeholder="123 Business Avenue" value={formData.street}
                        onChange={e => setFormData({ ...formData, street: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Additional (Suite, Building)</label>
                      <Input placeholder="Suite 200, Tower B" value={formData.addressLine2}
                        onChange={e => setFormData({ ...formData, addressLine2: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Postal / Area Code</label>
                      <Input placeholder="2100" value={formData.postalCode}
                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">City</label>
                      <Input placeholder="Copenhagen" value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Region / State</label>
                      <Input placeholder="Capital Region" value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.href = "/login"} className="flex-1 h-11"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
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
