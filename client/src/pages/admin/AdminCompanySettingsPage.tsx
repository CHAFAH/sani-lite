import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { COUNTRIES } from "@shared/countries";
import {
  Building2, Palette, Globe, Upload, Save, Loader2, X, Copy, Check,
} from "lucide-react";

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Education", "Manufacturing",
  "Retail & E-Commerce", "Real Estate", "Consulting", "Legal", "Media & Entertainment",
  "Telecommunications", "Energy & Utilities", "Transportation & Logistics",
  "Agriculture", "Government", "Non-Profit", "Other",
];

export default function AdminCompanySettingsPage() {
  const { data: company, isLoading } = trpc.company.get.useQuery();
  const updateMut = trpc.company.update.useMutation();
  const uploadLogoMut = trpc.company.uploadLogo.useMutation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "", industry: "", size: "", website: "", email: "", phone: "",
    country: "", address: "", customDomain: "", primaryColor: "#0D9488", secondaryColor: "#F59E0B",
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "", industry: company.industry || "", size: company.size || "",
        website: company.website || "", email: company.email || "", phone: company.phone || "",
        country: company.country || "", address: company.address || "",
        customDomain: company.customDomain || "",
        primaryColor: company.primaryColor || "#0D9488", secondaryColor: company.secondaryColor || "#F59E0B",
      });
      if (company.logoUrl) setLogoPreview(company.logoUrl);
    }
  }, [company]);

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync(form);
      utils.company.get.invalidate();
      toast.success("Company settings saved");
    } catch { toast.error("Failed to save settings"); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Logo must be under 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setLogoPreview(reader.result as string);
      try {
        const result = await uploadLogoMut.mutateAsync({ logoData: base64, mimeType: file.type });
        toast.success("Logo uploaded");
        utils.company.get.invalidate();
      } catch { toast.error("Failed to upload logo"); }
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const copyDomain = () => {
    const domain = form.customDomain || `${form.name.toLowerCase().replace(/\s+/g, "-")}.sani.app`;
    navigator.clipboard.writeText(domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCountry = COUNTRIES.find(c => c.code === form.country);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your company profile, branding, and domain</p>
          </div>
          <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700" disabled={updateMut.isPending}>
            {updateMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="profile" className="gap-2"><Building2 className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="branding" className="gap-2"><Palette className="w-4 h-4" /> Branding</TabsTrigger>
            <TabsTrigger value="domain" className="gap-2"><Globe className="w-4 h-4" /> Domain</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Basic information about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Industry</label>
                    <Select value={form.industry} onValueChange={v => setForm({ ...form, industry: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Size</label>
                    <Select value={form.size} onValueChange={v => setForm({ ...form, size: v })}>
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
                    <Select value={form.country} onValueChange={v => setForm({ ...form, country: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <div className="flex gap-2 mt-1">
                      {selectedCountry && (
                        <span className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600 whitespace-nowrap">
                          {selectedCountry.flag} {selectedCountry.phone}
                        </span>
                      )}
                      <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Website</label>
                    <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize your company's visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Company Logo</label>
                  <div className="flex items-start gap-6">
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}>
                        {logoUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Logo</>}
                      </Button>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
                      {logoPreview && (
                        <Button variant="ghost" size="sm" onClick={() => setLogoPreview("")} className="text-red-500 hover:text-red-700 p-0 h-auto">
                          <X className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.primaryColor}
                        onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-14 h-10 rounded-lg cursor-pointer border border-gray-200" />
                      <Input value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={form.secondaryColor}
                        onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-14 h-10 rounded-lg cursor-pointer border border-gray-200" />
                      <Input value={form.secondaryColor} onChange={e => setForm({ ...form, secondaryColor: e.target.value })} className="font-mono text-sm" />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Preview</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: form.primaryColor }}>
                        {form.name?.[0] || "A"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: form.primaryColor }}>{form.name || "Your Company"}</p>
                      <p className="text-xs text-gray-500">Employee OS Platform</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domain Tab */}
          <TabsContent value="domain">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Domain Settings</CardTitle>
                <CardDescription>Configure your company's portal domain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Custom Domain</label>
                  <Input placeholder="hr.acme.com" value={form.customDomain}
                    onChange={e => setForm({ ...form, customDomain: e.target.value })} className="mt-1" />
                  <p className="text-xs text-gray-500 mt-1">Point a CNAME record to sani.app to activate</p>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-teal-800 font-medium">Your Portal URL</p>
                      <p className="text-sm text-teal-600 mt-1 font-mono">
                        {form.customDomain || `${form.name.toLowerCase().replace(/\s+/g, "-")}.sani.app`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyDomain} className="text-teal-700">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">DNS Configuration</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="font-mono">CNAME</Badge>
                      <span className="text-gray-600">{form.customDomain || "your-domain.com"}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-600 font-mono">sani.app</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
