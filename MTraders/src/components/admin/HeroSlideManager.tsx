"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, ImagePlus, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Input";
import { compressImage } from "@/lib/image";
import type { HeroSlideMeta } from "@/types";

interface Draft {
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  text: "dark" | "light";
  active: boolean;
  sortOrder: number;
}

const emptyDraft: Draft = {
  tag: "",
  title: "",
  subtitle: "",
  cta: "",
  href: "",
  gradient: "linear-gradient(120deg,#f5e6d3 0%,#e8c9a0 100%)",
  text: "dark",
  active: true,
  sortOrder: 0,
};

export function HeroSlideManager({ slides }: { slides: HeroSlideMeta[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setDraft({ ...emptyDraft, sortOrder: slides.length });
    setImage("");
    setImageFile(null);
    setError("");
  };

  const startEdit = (s: HeroSlideMeta) => {
    setCreating(false);
    setEditingId(s.id);
    setDraft({
      tag: s.tag,
      title: s.title,
      subtitle: s.subtitle ?? "",
      cta: s.cta ?? "",
      href: s.href ?? "",
      gradient: s.gradient ?? "",
      text: s.text,
      active: s.active,
      sortOrder: s.sortOrder,
    });
    setImage(s.image ?? "");
    setImageFile(null);
    setError("");
  };

  const patch = (p: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...p }));

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const a = slides[index];
    const b = slides[target];
    const res = await fetch(`/api/hero-slides/${a.id}`, {
      method: "PATCH",
      body: (() => {
        const fd = new FormData();
        fd.set("sortOrder", String(b.sortOrder));
        return fd;
      })(),
    });
    if (!res.ok) return;
    await fetch(`/api/hero-slides/${b.id}`, {
      method: "PATCH",
      body: (() => {
        const fd = new FormData();
        fd.set("sortOrder", String(a.sortOrder));
        return fd;
      })(),
    });
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.set("tag", draft.tag);
      formData.set("title", draft.title);
      formData.set("subtitle", draft.subtitle);
      formData.set("cta", draft.cta);
      formData.set("href", draft.href);
      formData.set("gradient", draft.gradient);
      formData.set("text", draft.text);
      formData.set("active", String(draft.active));
      formData.set("sortOrder", String(draft.sortOrder));
      if (imageFile) formData.set("image", imageFile);
      if (!imageFile && editingId && !image) formData.set("removeImage", "true");

      const res = await fetch(
        editingId ? `/api/hero-slides/${editingId}` : "/api/hero-slides",
        {
          method: editingId ? "PATCH" : "POST",
          body: formData,
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          data?.error ||
            (res.status === 413
              ? "Image too large. Please use a smaller image."
              : "Failed to save slide.")
        );

      setCreating(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save slide.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: HeroSlideMeta) => {
    if (!confirm(`Delete slide "${s.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/hero-slides/${s.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete slide.");
    }
  };

  const formOpen = creating || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Manage the homepage hero banners. Add, edit or delete slides — each can
          use an image or a gradient background with customizable text.
        </p>
        <Button onClick={startCreate} disabled={formOpen}>
          <Plus className="h-4 w-4" /> New slide
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={submit}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">
              {editingId ? "Edit slide" : "New slide"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditingId(null);
              }}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tag *</Label>
              <Input
                required
                value={draft.tag}
                onChange={(e) => patch({ tag: e.target.value })}
                placeholder="e.g. New Season"
              />
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                required
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="e.g. Step Into the New Drop"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Subtitle</Label>
              <Textarea
                value={draft.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
                placeholder="Short supporting text"
              />
            </div>
            <div>
              <Label>Button text</Label>
              <Input
                value={draft.cta}
                onChange={(e) => patch({ cta: e.target.value })}
                placeholder="e.g. Shop Shoes"
              />
            </div>
            <div>
              <Label>Button link</Label>
              <Input
                value={draft.href}
                onChange={(e) => patch({ href: e.target.value })}
                placeholder="e.g. /category/shoes"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Background image</Label>
              <div className="flex items-start gap-4">
                {image ? (
                  <div className="h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={draft.title || "Slide"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-xs text-zinc-400"
                    style={{ background: draft.gradient || undefined }}
                  >
                    No image
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:border-brand hover:text-brand">
                    <ImagePlus className="h-4 w-4" />
                    {image || imageFile ? "Change image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const compressed = await compressImage(f, 1920);
                        setImageFile(compressed);
                        const reader = new FileReader();
                        reader.onload = () => setImage(String(reader.result));
                        reader.readAsDataURL(compressed);
                      }}
                    />
                  </label>
                  {(image || imageFile) && (
                    <button
                      type="button"
                      onClick={() => {
                        setImage("");
                        setImageFile(null);
                      }}
                      className="text-left text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove image
                    </button>
                  )}
                  <p className="text-xs text-zinc-400">
                    JPG, PNG, WebP. Resized automatically on upload. Leave empty to use a gradient instead.
                  </p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Gradient fallback (used when no image)</Label>
              <Input
                value={draft.gradient}
                onChange={(e) => patch({ gradient: e.target.value })}
                placeholder="linear-gradient(120deg,#f5e6d3 0%,#e8c9a0 100%)"
              />
            </div>
            <div>
              <Label>Text color</Label>
              <Select
                value={draft.text}
                onChange={(e) =>
                  patch({ text: e.target.value === "light" ? "light" : "dark" })
                }
              >
                <option value="dark">Dark (on light backgrounds)</option>
                <option value="light">Light (on dark backgrounds)</option>
              </Select>
            </div>
            <div>
              <Label>Active</Label>
              <label className="flex h-10 cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => patch({ active: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-brand)]"
                />
                Show on homepage
              </label>
            </div>
          </div>

          <Button type="submit" className="mt-6" loading={saving}>
            {editingId ? "Save changes" : "Create slide"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                {s.image ? (
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-zinc-200"
                    style={{ background: s.gradient || undefined }}
                  >
                    <span className="text-xs text-zinc-500">No img</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-xs text-zinc-400">
                    {s.tag} · {s.cta ? `${s.cta} → ${s.href || "/"}` : "no button"} ·{" "}
                    {s.active ? "active" : "hidden"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => startEdit(s)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-brand hover:text-brand"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(s)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Delete ${s.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && !formOpen && (
          <p className="rounded-xl border border-dashed border-zinc-300 px-5 py-8 text-center text-sm text-zinc-400">
            No hero slides yet. Create one to show on the homepage.
          </p>
        )}
      </div>
    </div>
  );
}