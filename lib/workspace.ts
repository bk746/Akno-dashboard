import { supabase } from "@/lib/supabase/client";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return code;
}

export type WorkspaceInfo = {
  id: string;
  name: string;
  inviteCode: string;
  role: "owner" | "member";
};

export async function fetchUserWorkspace(userId: string): Promise<WorkspaceInfo | null> {
  if (!supabase) return null;

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("role, joined_at, workspaces(id, name, invite_code)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !membership?.workspaces) return null;

  const raw = membership.workspaces;
  const workspace = (Array.isArray(raw) ? raw[0] : raw) as {
    id: string;
    name: string;
    invite_code: string;
  } | null;

  if (!workspace) return null;

  return {
    id: workspace.id,
    name: workspace.name,
    inviteCode: workspace.invite_code,
    role: membership.role as "owner" | "member",
  };
}

export async function createWorkspaceForUser(userId: string, name = "Équipe AKNO") {
  if (!supabase) throw new Error("Supabase non configuré");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateInviteCode();
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({ name, invite_code: inviteCode, created_by: userId })
      .select("id, name, invite_code")
      .single();

    if (workspaceError || !workspace) continue;

    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: "owner",
    });

    if (memberError) {
      await supabase.from("workspaces").delete().eq("id", workspace.id);
      throw memberError;
    }

    return {
      id: workspace.id,
      name: workspace.name,
      inviteCode: workspace.invite_code,
      role: "owner" as const,
    };
  }

  throw new Error("Impossible de créer l'espace équipe");
}

export async function joinWorkspaceByInviteCode(userId: string, inviteCode: string) {
  if (!supabase) throw new Error("Supabase non configuré");

  const normalized = inviteCode.trim().toUpperCase();
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, invite_code")
    .eq("invite_code", normalized)
    .maybeSingle();

  if (error || !workspace) {
    throw new Error("Code équipe invalide");
  }

  const { error: memberError } = await supabase.from("workspace_members").upsert(
    {
      workspace_id: workspace.id,
      user_id: userId,
      role: "member",
    },
    { onConflict: "workspace_id,user_id" },
  );

  if (memberError) throw memberError;

  return {
    id: workspace.id,
    name: workspace.name,
    inviteCode: workspace.invite_code,
    role: "member" as const,
  };
}

export async function ensureUserWorkspace(userId: string) {
  const existing = await fetchUserWorkspace(userId);
  if (existing) return existing;
  return createWorkspaceForUser(userId);
}
