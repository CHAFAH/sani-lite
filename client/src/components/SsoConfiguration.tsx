import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, Copy, Check } from "lucide-react";

type Provider = "google" | "microsoft" | "okta" | "custom_oidc";

const PROVIDER_INFO: Record<Provider, { name: string; description: string; docsUrl: string }> = {
  google: {
    name: "Google",
    description: "Sign in with Google Workspace or personal Google accounts",
    docsUrl: "https://developers.google.com/identity/protocols/oauth2",
  },
  microsoft: {
    name: "Microsoft",
    description: "Sign in with Microsoft Entra ID or Office 365",
    docsUrl: "https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app",
  },
  okta: {
    name: "Okta",
    description: "Enterprise identity management with Okta",
    docsUrl: "https://developer.okta.com/docs/guides/implement-oauth/",
  },
  custom_oidc: {
    name: "Custom OIDC",
    description: "Connect any OpenID Connect compatible provider",
    docsUrl: "https://openid.net/connect/",
  },
};

interface SsoConfig {
  id: number;
  companyId: number;
  provider: Provider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  enabled: boolean | null;
  metadata?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export default function SsoConfiguration() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    provider: "google" as Provider,
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    enabled: true,
  });

  const listQuery = trpc.sso.list.useQuery();
  const createMutation = trpc.sso.create.useMutation();
  const updateMutation = trpc.sso.update.useMutation();
  const deleteMutation = trpc.sso.delete.useMutation();

  const handleOpenDialog = (config?: SsoConfig) => {
    if (config) {
      setEditingId(config.id);
      setFormData({
        provider: config.provider,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        enabled: config.enabled ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({
        provider: "google",
        clientId: "",
        clientSecret: "",
        redirectUri: "",
        enabled: true,
      });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.clientId || !formData.clientSecret || !formData.redirectUri) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("SSO configuration updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("SSO configuration created successfully");
      }
      setIsOpen(false);
      listQuery.refetch();
    } catch (error) {
      toast.error(editingId ? "Failed to update SSO configuration" : "Failed to create SSO configuration");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SSO configuration?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("SSO configuration deleted successfully");
      listQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete SSO configuration");
    }
  };

  const handleToggle = async (config: SsoConfig) => {
    try {
      await updateMutation.mutateAsync({
        id: config.id,
        enabled: !config.enabled,
      });
      listQuery.refetch();
    } catch (error) {
      toast.error("Failed to toggle SSO configuration");
    }
  };

  const handleCopyRedirectUri = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedId(Date.now());
    setTimeout(() => setCopiedId(null), 2000);
  };

  const configs = listQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Single Sign-On (SSO)</h2>
          <p className="text-gray-600 mt-1">Configure identity providers for your team</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit SSO Configuration" : "Add SSO Provider"}</DialogTitle>
              <DialogDescription>
                Configure a new identity provider for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Provider *</label>
                <Select value={formData.provider} onValueChange={(value: any) => setFormData({ ...formData, provider: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  {PROVIDER_INFO[formData.provider].description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Client ID *</label>
                <Input
                  placeholder="Your OAuth client ID"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Client Secret *</label>
                <Input
                  type="password"
                  placeholder="Your OAuth client secret"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Redirect URI *</label>
                <Input
                  type="url"
                  placeholder="https://your-domain.com/auth/callback"
                  value={formData.redirectUri}
                  onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This is the callback URL you need to register in your provider's settings
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enabled</label>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  Need help setting up? Check the{" "}
                  <a
                    href={PROVIDER_INFO[formData.provider].docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    provider documentation
                  </a>
                </p>
              </div>

              <Button
                onClick={handleSave}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingId ? "Update Configuration" : "Add Provider"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SSO Configurations List */}
      {listQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : configs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((config: SsoConfig) => (
            <Card key={config.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{PROVIDER_INFO[config.provider].name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {config.provider === "custom_oidc" ? "Custom OIDC Provider" : `${PROVIDER_INFO[config.provider].name} OAuth`}
                    </CardDescription>
                  </div>
                  <Badge variant={config.enabled ? "default" : "secondary"}>
                    {config.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Client ID</p>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded truncate">{config.clientId}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Redirect URI</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded flex-1 truncate">{config.redirectUri}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyRedirectUri(config.redirectUri)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === config.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(config)}
                    disabled={updateMutation.isPending}
                  >
                    {config.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(config)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(config.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-500 mb-4">No SSO providers configured yet</p>
            <Button onClick={() => handleOpenDialog()} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Provider
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base">SSO Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>1. Choose a provider:</strong> Select Google, Microsoft, Okta, or any OIDC-compatible provider
          </p>
          <p>
            <strong>2. Get credentials:</strong> Create an OAuth application in your provider's console
          </p>
          <p>
            <strong>3. Configure redirect URI:</strong> Use the URI shown above in your provider's settings
          </p>
          <p>
            <strong>4. Add to SANI:</strong> Enter your Client ID and Secret here
          </p>
          <p>
            <strong>5. Enable for team:</strong> Once configured, your team members can sign in with SSO
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
