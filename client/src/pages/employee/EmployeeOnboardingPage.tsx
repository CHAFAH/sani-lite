import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, User, Phone, Heart, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const steps = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Personal Info", icon: User },
  { id: 3, title: "Emergency Contact", icon: Phone },
  { id: 4, title: "Complete", icon: CheckCircle },
];

export default function EmployeeOnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const { data: employees = [] } = trpc.employee.list.useQuery();

  const [form, setForm] = useState({
    dateOfBirth: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const myEmployee = employees.find((e: any) => e.userId === user?.id);

  const upsertDetails = trpc.personalDetails.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile completed!");
      setStep(4);
    },
    onError: () => toast.error("Failed to save"),
  });

  const handleSubmit = () => {
    if (!myEmployee) { toast.error("Employee profile not found"); return; }
    upsertDetails.mutate({
      employeeId: myEmployee.id,
      dateOfBirth: form.dateOfBirth || undefined,
      address: form.address || undefined,
      emergencyContactName: form.emergencyContactName || undefined,
      emergencyContactPhone: form.emergencyContactPhone || undefined,
      emergencyContactRelation: form.emergencyContactRelation || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step >= s.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {step > s.id ? <CheckCircle size={16} /> : s.id}
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-1 ${step > s.id ? "bg-indigo-600" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto">
                  <Sparkles size={32} className="text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome to SANI!</h1>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! Let's get your profile set up. This will only take a minute.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 mt-4" onClick={() => setStep(2)}>
                  Get Started <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                    <p className="text-xs text-slate-500">Tell us a bit about yourself</p>
                  </div>
                </div>
                <div><Label>Home Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, City, State" /></div>
                <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} /></div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16} className="mr-2" />Back</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep(3)}>Continue <ArrowRight size={16} className="ml-2" /></Button>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Heart size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Emergency Contact</h2>
                    <p className="text-xs text-slate-500">Someone we can reach in case of emergency</p>
                  </div>
                </div>
                <div><Label>Contact Name *</Label><Input value={form.emergencyContactName} onChange={e => setForm(p => ({ ...p, emergencyContactName: e.target.value }))} placeholder="Full name" /></div>
                <div><Label>Contact Phone *</Label><Input value={form.emergencyContactPhone} onChange={e => setForm(p => ({ ...p, emergencyContactPhone: e.target.value }))} placeholder="+1 (555) 000-0000" /></div>
                <div><Label>Relationship</Label><Input value={form.emergencyContactRelation} onChange={e => setForm(p => ({ ...p, emergencyContactRelation: e.target.value }))} placeholder="e.g. Spouse, Parent" /></div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft size={16} className="mr-2" />Back</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={upsertDetails.isPending}>
                    {upsertDetails.isPending ? "Saving..." : "Complete Setup"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">You're All Set!</h1>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Your profile is complete. You can always update your information from your profile page.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 mt-4" onClick={() => setLocation("/employee")}>
                  Go to Dashboard <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
