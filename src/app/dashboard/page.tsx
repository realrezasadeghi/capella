"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Layers, FolderOpen, MoreVertical, Pencil, Trash2,
  LogOut, User, Clock, Database, ChevronRight, Search,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useProjectStore, type UserProject } from "@/lib/projectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import AuthGuard from "@/components/AuthGuard";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "همین الان";
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  const days = Math.floor(hrs / 24);
  return `${days} روز پیش`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ----------------------------------------------------------------
// Create / Edit Project Dialog
// ----------------------------------------------------------------

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  editProject?: UserProject | null;
}

function ProjectDialog({ open, onClose, editProject }: ProjectDialogProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editProject?.name ?? "");
      setDesc(editProject?.description ?? "");
    }
  }, [open, editProject]);

  const handleSave = async () => {
    if (!name.trim() || !currentUser) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    if (editProject) {
      updateProject(editProject.id, name, desc);
    } else {
      createProject(currentUser.id, name, desc);
    }
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editProject ? "ویرایش پروژه" : "پروژه جدید"}</DialogTitle>
          <DialogDescription>
            {editProject ? "مشخصات پروژه را ویرایش کنید" : "یک پروژه مدل‌سازی جدید ایجاد کنید"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">نام پروژه *</Label>
            <Input
              id="proj-name"
              placeholder="مثال: سیستم کنترل پرواز"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">توضیحات (اختیاری)</Label>
            <Textarea
              id="proj-desc"
              placeholder="هدف و دامنه پروژه..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال ذخیره...
              </span>
            ) : editProject ? "ذخیره تغییرات" : "ایجاد پروژه"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------
// Project Card
// ----------------------------------------------------------------

interface ProjectCardProps {
  project: UserProject;
  modelCount: number;
  onEdit: (p: UserProject) => void;
  onDelete: (p: UserProject) => void;
}

function ProjectCard({ project, modelCount, onEdit, onDelete }: ProjectCardProps) {
  const router = useRouter();

  return (
    <div
      className="group relative rounded-2xl border border-neutral-200 bg-white p-6 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => router.push(`/project/${project.id}`)}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: project.color }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4 mt-1">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0"
          style={{ backgroundColor: project.color + "20", border: `1px solid ${project.color}30` }}
        >
          {project.icon}
        </div>

        {/* Options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil size={14} />
              ویرایش
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => onDelete(project)}
            >
              <Trash2 size={14} />
              حذف پروژه
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Name & desc */}
      <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Database size={11} />
            {modelCount} مدل
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeAgo(project.updatedAt)}
          </span>
        </div>
        <ChevronRight size={14} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Delete Confirm Dialog
// ----------------------------------------------------------------

interface DeleteDialogProps {
  project: UserProject | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({ project, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>حذف پروژه</DialogTitle>
          <DialogDescription>
            پروژه <strong>«{project?.name}»</strong> و تمام مدل‌های آن حذف می‌شود.
            این عمل غیرقابل بازگشت است.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>انصراف</Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 size={14} />
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------
// Dashboard page
// ----------------------------------------------------------------

function DashboardContent() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const projects = useProjectStore((s) => s.getProjectsByOwner(currentUser?.id ?? ""));
  const models = useProjectStore((s) => s.models);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProject | null>(null);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ---- Topbar ---- */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-neutral-900 tracking-tight text-sm">Noqte</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-600 font-medium">پروژه‌ها</span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 hover:bg-neutral-100 transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs">
                    {getInitials(currentUser?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-700 hidden sm:block">
                  {currentUser?.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
              <div className="px-2 py-1.5 text-xs text-neutral-400 truncate">
                {currentUser?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                <LogOut size={14} />
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ---- Main ---- */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              پروژه‌های من
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {projects.length} پروژه
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="جستجو..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-9 w-52 h-9"
              />
            </div>

            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              پروژه جدید
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              {search ? "نتیجه‌ای یافت نشد" : "اولین پروژه خود را بسازید"}
            </h3>
            <p className="text-sm text-neutral-400 mb-6 max-w-sm">
              {search
                ? "جستجوی دیگری امتحان کنید"
                : "پروژه‌ها فضای کاری مدل‌های Arcadia شما هستند. از یک پروژه شروع کنید."}
            </p>
            {!search && (
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                پروژه جدید
              </Button>
            )}
          </div>
        )}

        {/* Projects grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  modelCount={models.filter((m) => m.projectId === project.id).length}
                  onEdit={(p) => setEditTarget(p)}
                  onDelete={(p) => setDeleteTarget(p)}
                />
              ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ProjectDialog
        open={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); }}
        editProject={editTarget}
      />

      <DeleteDialog
        project={deleteTarget}
        onConfirm={() => { if (deleteTarget) deleteProject(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
