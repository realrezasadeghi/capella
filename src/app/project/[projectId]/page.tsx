"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Plus, Layers, ArrowLeft, MoreVertical, Pencil, Trash2,
  Clock, Network, ChevronRight, Database, LogOut, Search, GitBranch,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useProjectStore, type ProjectModel, type UserProject } from "@/lib/projectStore";
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
  return `${Math.floor(hrs / 24)} روز پیش`;
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ----------------------------------------------------------------
// Model Dialog
// ----------------------------------------------------------------

interface ModelDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  editModel?: ProjectModel | null;
}

function ModelDialog({ open, onClose, projectId, editModel }: ModelDialogProps) {
  const createModel = useProjectStore((s) => s.createModel);
  const updateModel = useProjectStore((s) => s.updateModel);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editModel?.name ?? "");
      setDesc(editModel?.description ?? "");
    }
  }, [open, editModel]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    if (editModel) {
      updateModel(editModel.id, name, desc);
    } else {
      createModel(projectId, name, desc);
    }
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editModel ? "ویرایش مدل" : "مدل جدید"}</DialogTitle>
          <DialogDescription>
            {editModel
              ? "مشخصات مدل را ویرایش کنید"
              : "یک مدل Arcadia جدید در این پروژه ایجاد کنید"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="model-name">نام مدل *</Label>
            <Input
              id="model-name"
              placeholder="مثال: معماری سیستم اصلی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model-desc">توضیحات (اختیاری)</Label>
            <Textarea
              id="model-desc"
              placeholder="هدف و دامنه این مدل..."
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
            ) : editModel ? "ذخیره" : "ایجاد مدل"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------
// Model Card
// ----------------------------------------------------------------

interface ModelCardProps {
  model: ProjectModel;
  projectId: string;
  onEdit: (m: ProjectModel) => void;
  onDelete: (m: ProjectModel) => void;
}

function ModelCard({ model, projectId, onEdit, onDelete }: ModelCardProps) {
  const router = useRouter();

  return (
    <div
      className="group relative rounded-2xl border border-neutral-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => router.push(`/editor/${projectId}/${model.id}`)}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center">
          <Network className="w-5 h-5 text-blue-600" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-all">
              <MoreVertical size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onEdit(model)}>
              <Pencil size={13} />
              ویرایش
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => onDelete(model)}
            >
              <Trash2 size={13} />
              حذف مدل
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{model.name}</h3>
      {model.description && (
        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
          {model.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary" className="text-[10px] gap-1">
          <GitBranch size={9} />
          {model.diagramCount} دیاگرام
        </Badge>
        <Badge variant="secondary" className="text-[10px] gap-1">
          <Database size={9} />
          {model.elementCount} عنصر
        </Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="flex items-center gap-1 text-[11px] text-neutral-400">
          <Clock size={10} />
          {timeAgo(model.updatedAt)}
        </span>
        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          باز کردن
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Delete Dialog
// ----------------------------------------------------------------

interface DeleteModelDialogProps {
  model: ProjectModel | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModelDialog({ model, onConfirm, onCancel }: DeleteModelDialogProps) {
  return (
    <Dialog open={!!model} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>حذف مدل</DialogTitle>
          <DialogDescription>
            مدل <strong>«{model?.name}»</strong> حذف می‌شود. این عمل غیرقابل بازگشت است.
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
// Project Page Content
// ----------------------------------------------------------------

function ProjectContent() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const models = useProjectStore((s) => s.getModelsByProject(projectId));
  const deleteModel = useProjectStore((s) => s.deleteModel);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectModel | null>(null);

  // Redirect if project not found
  useEffect(() => {
    if (!project) router.replace("/dashboard");
  }, [project, router]);

  if (!project) return null;

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => { logout(); router.replace("/"); };

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ---- Topbar ---- */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm min-w-0">
            <Link href="/" className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <Layers className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-neutral-900 tracking-tight hidden sm:block">Noqte</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-800 transition-colors truncate max-w-[100px] sm:max-w-none">
              پروژه‌ها
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-lg shrink-0">{project.icon}</span>
              <span className="font-semibold text-neutral-900 truncate">{project.name}</span>
            </div>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-neutral-100 transition-colors shrink-0">
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
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

        {/* Project header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border"
              style={{ backgroundColor: project.color + "18", borderColor: project.color + "30" }}
            >
              {project.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-neutral-500 mt-0.5">{project.description}</p>
              )}
              <p className="text-xs text-neutral-400 mt-1">{models.length} مدل</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="جستجو..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-9 w-48 h-9"
              />
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              مدل جدید
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Network className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              {search ? "نتیجه‌ای یافت نشد" : "اولین مدل را بسازید"}
            </h3>
            <p className="text-sm text-neutral-400 mb-6 max-w-sm">
              {search
                ? "جستجوی دیگری امتحان کنید"
                : "مدل‌های Arcadia شامل دیاگرام‌ها، عناصر و اتصالات لایه‌های OA تا EPBS هستند."}
            </p>
            {!search && (
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                مدل جدید
              </Button>
            )}
          </div>
        )}

        {/* Models grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  projectId={projectId}
                  onEdit={(m) => setEditTarget(m)}
                  onDelete={(m) => setDeleteTarget(m)}
                />
              ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ModelDialog
        open={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); }}
        projectId={projectId}
        editModel={editTarget}
      />

      <DeleteModelDialog
        model={deleteTarget}
        onConfirm={() => { if (deleteTarget) deleteModel(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function ProjectPage() {
  return (
    <AuthGuard>
      <ProjectContent />
    </AuthGuard>
  );
}
