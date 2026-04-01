/*
 * Announcements — Company announcements and news
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Megaphone, Trash2 } from "lucide-react";

const TYPES = ["general", "urgent", "celebration", "policy"] as const;

export default function AnnouncementsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "general" as typeof TYPES[number] });

  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery();
  const createAnn = trpc.announcements.create.useMutation({ onSuccess: () => { utils.announcements.list.invalidate(); setIsOpen(false); setForm({ title: "", content: "", type: "general" }); toast.success("Announcement published"); } });
  const deleteAnn = trpc.announcements.delete.useMutation({ onSuccess: () => { utils.announcements.list.invalidate(); toast.success("Announcement deleted"); } });

  const typeColor: Record<string, string> = { general: "bg-blue-50 text-blue-600", urgent: "bg-red-50 text-red-600", celebration: "bg-amber-50 text-amber-600", policy: "bg-gray-50 text-gray-600" };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Announcements</h1>
            <p className="text-muted-foreground text-sm mt-1">Company-wide news and updates</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />New Announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                <Input placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <Textarea placeholder="Content" rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as typeof TYPES[number] }))}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createAnn.isPending} onClick={() => {
                  if (!form.title || !form.content) { toast.error("Title and content required"); return; }
                  createAnn.mutate({ title: form.title, content: form.content, type: form.type });
                }}>{createAnn.isPending ? "Publishing..." : "Publish"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : (announcements || []).length === 0 ? (
          <Card className="py-16 text-center"><CardContent><Megaphone size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No announcements yet</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(announcements || []).map(ann => (
              <motion.div key={ann.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl border shadow-sm p-5 ${ann.type === "urgent" ? "bg-red-50/30 border-red-200/50" : "bg-white border-border/50"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone size={14} className="text-muted-foreground" />
                    <h3 className="font-semibold">{ann.title}</h3>
                    <Badge variant="outline" className={typeColor[ann.type] || typeColor.general}>{ann.type}</Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0" onClick={() => { if (confirm("Delete this announcement?")) deleteAnn.mutate({ id: ann.id }); }}><Trash2 size={12} /></Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                <p className="text-xs text-muted-foreground mt-3">{new Date(ann.createdAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
