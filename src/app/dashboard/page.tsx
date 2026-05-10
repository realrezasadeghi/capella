"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layers, MoreVertical, Pencil, Trash2, LogOut, Search, FolderOpen, Database, Clock, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useProjectStore, type UserProject } from "@/lib/projectStore";
import { useT, useTimeAgo } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import AuthGuard from "@/components/AuthGuard";

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
}

function ProjectDialog({ open, onClose, edit }: { open: boolean; onClose: () => void; edit?: UserProject|null }) {
  const { t } = useT();
  const user = useAuthStore(s => s.currentUser);
  const createProject = useProjectStore(s => s.createProject);
  const updateProject = useProjectStore(s => s.updateProject);
  const [name, setName] = useState(edit?.name ?? "");
  const [desc, setDesc] = useState(edit?.description ?? "");
  const [busy, setBusy] = useState(false);

  const handleOpen = (o: boolean) => { if (o) { setName(edit?.name ?? ""); setDesc(edit?.description ?? ""); } };

  const save = async () => {
    if (!name.trim() || !user) return;
    setBusy(true);
    await new Promise(r => setTimeout(r,200));
    edit ? updateProject(edit.id, name, desc) : createProject(user.id, name, desc);
    setBusy(false); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => { handleOpen(o); if (!o) onClose(); }}>
      <DialogContent className="max-w-md bg-[var(--surface)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text)]">{edit ? t.dashboard.editProjectTitle : t.dashboard.createProjectTitle}</DialogTitle>
          <DialogDescription className="text-[var(--text-3)]">{edit ? "" : t.dashboard.createProjectDesc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">{t.dashboard.projectNameLabel} *</label>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
              placeholder={t.dashboard.projectNamePlaceholder} autoFocus
              className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">{t.dashboard.descLabel} ({t.common.optional})</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
              placeholder={t.dashboard.descPlaceholder}
              className="input-field resize-none" />
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text)] hover:border-[var(--brand)] transition-all">{t.common.cancel}</button>
          <button onClick={save} disabled={!name.trim()||busy}
            className="btn-brand px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {busy && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {edit ? t.dashboard.saveChanges : t.dashboard.createProjectTitle}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ project, onConfirm, onCancel }: { project: UserProject|null; onConfirm:()=>void; onCancel:()=>void }) {
  const { t } = useT();
  return (
    <Dialog open={!!project} onOpenChange={o=>!o&&onCancel()}>
      <DialogContent className="max-w-sm bg-[var(--surface)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text)]">{t.dashboard.deleteTitle}</DialogTitle>
          <DialogDescription className="text-[var(--text-3)]">
            {t.dashboard.deleteDesc} <strong className="text-[var(--text-2)]">«{project?.name}»</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text)] transition-all">{t.common.cancel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold bg-err-600 text-white hover:bg-err-500 transition-colors flex items-center gap-1.5">
            <Trash2 size={13} />{t.common.delete}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { t, dir } = useT();
  const timeAgo = useTimeAgo();
  const user = useAuthStore(s => s.currentUser);
  const logout = useAuthStore(s => s.logout);
  const projects = useProjectStore(s => s.getProjectsByOwner(user?.id ?? ""));
  const models = useProjectStore(s => s.models);
  const deleteProject = useProjectStore(s => s.deleteProject);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProject|null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProject|null>(null);

  const filtered = projects
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime());

  return (
    <div dir={dir} className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-xl btn-brand flex items-center justify-center">
                <Layers size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm hidden sm:block">{t.common.appName}</span>
            </Link>
            <span className="text-white/20 hidden sm:block">/</span>
            <span className="text-sm font-medium text-white/60 hidden sm:block">{t.nav.dashboard}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-white/8 transition-colors ms-1">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-brand-700 text-white">{initials(user?.name??"U")}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white/70 hidden sm:block">{user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[var(--surface)] border-[var(--border)]">
                <DropdownMenuLabel className="text-[var(--text-3)]">{t.nav.account}</DropdownMenuLabel>
                <div className="px-2 py-1 text-xs text-[var(--text-muted)] truncate">{user?.email}</div>
                <DropdownMenuSeparator className="bg-[var(--border)]" />
                <DropdownMenuItem className="text-err-600 focus:text-err-600 focus:bg-err-50 dark:focus:bg-err-950/30 cursor-pointer" onClick={()=>{logout();router.replace("/");}}>
                  <LogOut size={13} />{t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 page-enter">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">{t.dashboard.title}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{projects.length} {t.dashboard.models}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.common.search}
                className="input-field ps-9 w-52 h-9 text-sm" />
            </div>
            <button onClick={()=>setShowCreate(true)}
              className="btn-brand flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
              <Plus size={16} />{t.dashboard.newProject}
            </button>
          </div>
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand-subtle)] flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-[var(--brand)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-2)] mb-2">
              {search ? t.common.noResults : t.dashboard.emptyTitle}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">{!search && t.dashboard.emptyDesc}</p>
            {!search && (
              <button onClick={()=>setShowCreate(true)} className="btn-brand flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold">
                <Plus size={15} />{t.dashboard.newProject}
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div key={p.id} onClick={()=>router.push(`/project/${p.id}`)}
                className="card card-hover relative p-5 cursor-pointer group">
                {/* Accent bar */}
                <div className="absolute top-0 start-0 end-0 h-[3px] rounded-t-[20px]" style={{backgroundColor: p.color}} />

                <div className="flex items-start justify-between mb-4 mt-0.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border"
                    style={{ backgroundColor: p.color+"15", borderColor: p.color+"25" }}>
                    {p.icon}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e=>e.stopPropagation()}>
                      <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={15} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[var(--surface)] border-[var(--border)]" onClick={e=>e.stopPropagation()}>
                      <DropdownMenuItem className="cursor-pointer text-[var(--text-2)] focus:text-[var(--text)]" onClick={()=>setEditTarget(p)}>
                        <Pencil size={13} />{t.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[var(--border)]"/>
                      <DropdownMenuItem className="cursor-pointer text-err-600 focus:text-err-600 focus:bg-err-50 dark:focus:bg-err-950/30" onClick={()=>setDeleteTarget(p)}>
                        <Trash2 size={13} />{t.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-[var(--text)] mb-1 line-clamp-1">{p.name}</h3>
                {p.description && <p className="text-xs text-[var(--text-3)] line-clamp-2 mb-3 leading-relaxed">{p.description}</p>}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-2)]">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Database size={11} />{models.filter(m=>m.projectId===p.id).length} {t.dashboard.models}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />{timeAgo(p.updatedAt)}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--border)] group-hover:text-[var(--brand)] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProjectDialog open={showCreate || !!editTarget} onClose={()=>{setShowCreate(false);setEditTarget(null);}} edit={editTarget} />
      <DeleteDialog project={deleteTarget} onConfirm={()=>{if(deleteTarget)deleteProject(deleteTarget.id);setDeleteTarget(null);}} onCancel={()=>setDeleteTarget(null)} />
    </div>
  );
}

export default function DashboardPage() {
  return <AuthGuard><DashboardContent /></AuthGuard>;
}
