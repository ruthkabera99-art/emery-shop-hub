import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Shield, ShieldCheck, UserPlus, Trash2, Search, RefreshCw } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface RoleEntry {
  id: string;
  user_id: string;
  role: AppRole;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
  email?: string;
}

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-destructive/15 text-destructive",
  moderator: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  user: "bg-muted text-muted-foreground",
};

const ROLE_ICONS: Record<AppRole, typeof Shield> = {
  admin: ShieldCheck,
  moderator: Shield,
  user: Shield,
};

const RolesManager = () => {
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("moderator");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleEntry | null>(null);
  const { toast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch profile info for each user
    const userIds = [...new Set((data || []).map((r) => r.user_id))];
    let profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      if (profiles) {
        profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
      }
    }

    setRoles(
      (data || []).map((r) => ({
        ...r,
        profile: profileMap[r.user_id] || null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = async () => {
    if (!newUserId.trim()) {
      toast({ title: "Error", description: "Please enter a user ID.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("user_roles").insert({
      user_id: newUserId.trim(),
      role: newRole,
    });
    setSaving(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate")
          ? "This user already has this role."
          : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Role Assigned", description: `${newRole} role assigned successfully.` });
    setAddDialog(false);
    setNewUserId("");
    fetchRoles();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role Revoked", description: `${deleteTarget.role} role has been removed.` });
    }
    setDeleteTarget(null);
    fetchRoles();
  };

  const filtered = roles.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.user_id.toLowerCase().includes(s) ||
      r.role.includes(s) ||
      (r.profile?.full_name || "").toLowerCase().includes(s)
    );
  });

  const stats = {
    admins: roles.filter((r) => r.role === "admin").length,
    moderators: roles.filter((r) => r.role === "moderator").length,
    users: roles.filter((r) => r.role === "user").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="font-display text-3xl font-bold">User Roles</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRoles} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddDialog(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Assign Role
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([
          { label: "Admins", count: stats.admins, color: "text-destructive" },
          { label: "Moderators", count: stats.moderators, color: "text-amber-600 dark:text-amber-400" },
          { label: "Users", count: stats.users, color: "text-muted-foreground" },
        ] as const).map((s) => (
          <div key={s.label} className="bg-card rounded-lg p-4 shadow-soft text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">User ID</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {roles.length === 0
                      ? "No roles assigned yet. Click 'Assign Role' to get started."
                      : "No results match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const Icon = ROLE_ICONS[r.role];
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {(r.profile?.full_name || "?")[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{r.profile?.full_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{r.user_id.slice(0, 8)}...</code>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[r.role]}`}>
                          <Icon className="w-3 h-3" />
                          {r.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(r)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">User ID</Label>
              <Input
                placeholder="Paste the user's UUID from Supabase Auth"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find user IDs in your Supabase Auth → Users dashboard.
              </p>
            </div>
            <div>
              <Label className="mb-1.5 block">Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Role</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Remove the <strong>{deleteTarget?.role}</strong> role from{" "}
            <strong>{deleteTarget?.profile?.full_name || deleteTarget?.user_id.slice(0, 8)}</strong>?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Revoke</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesManager;
