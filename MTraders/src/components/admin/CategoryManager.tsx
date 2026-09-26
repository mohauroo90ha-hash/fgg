"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, ImagePlus } from "lucide-react";
import { slugify } from "@/lib/helpers";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { CategoryWithMeta } from "@/types";

interface AttrDraft {
  name: string;
  values: string;
}

const emptyAttrs: AttrDraft[] = [];

export function CategoryManager({
  categories,
}: {
  categories: CategoryWithMeta[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attrs, setAttrs] = useState<AttrDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setImageFile(null);
    setAttrs([{ name: "", values: "" }]);
    setError("");
  };

  const startEdit = (c: CategoryWithMeta) => {
    setCreating(false);
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description ?? "");
    setImage(c.image ?? "");
    setImageFile(null);
    setAttrs(
      c.attributes.length
        ? c.attributes.map((a) => ({ name: a.name, values: a.values.join(", ") }))
        : [{ name: "", values: "" }]
    );
    setError("");
  };

  const updateAttr = (i: number, patch: Partial<AttrDraft>) => {
    setAttrs((prev) => prev.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const cleanAttrs = attrs
      .filter((a) => a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        values: a.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }));

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("slug", slug || slugify(name));
      formData.set("description", description);
      formData.set("attributes", JSON.stringify(cleanAttrs));
      if (imageFile) formData.set("image", imageFile);
      if (!imageFile && editingId && !image) formData.set("removeImage", "true");

      const res = await fetch(
        editingId ? `/api/categories/${editingId}` : "/api/categories",
        {
          method: editingId ? "PATCH" : "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category.");

      setCreating(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: CategoryWithMeta) => {
    if (
      !confirm(
        c.productCount > 0
          ? `Delete category "${c.name}" and its ${c.productCount} product(s)? This cannot be undone.`
          : `Delete category "${c.name}"?`
      )
    )
      return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete category.");
    }
  };

  const formOpen = creating || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Categories define the structure and dynamic attributes of your products.
        </p>
        <Button onClick={startCreate} disabled={formOpen}>
          <Plus className="h-4 w-4" /> New category
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
              {editingId ? "Edit category" : "New category"}
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
              <Label>Name *</Label>
              <Input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (editingId) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Sunglasses"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="sunglasses"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description shown on the category page"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Category image</Label>
              <div className="flex items-start gap-4">
                <PlaceholderImage
                  src={image}
                  alt={name || "Category"}
                  label={name.charAt(0).toUpperCase() || "C"}
                  className="h-24 w-24 shrink-0 rounded-lg border border-zinc-200"
                />
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:border-brand hover:text-brand">
                    <ImagePlus className="h-4 w-4" />
                    {image || imageFile ? "Change image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setImageFile(f ?? null);
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => setImage(String(reader.result));
                        reader.readAsDataURL(f);
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
                    JPG, PNG, WebP. Max 5MB. Shown on the homepage and category page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Label>Custom attributes (drive filters & variants)</Label>
            <div className="space-y-3">
              {attrs.map((a, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    value={a.name}
                    onChange={(e) => updateAttr(i, { name: e.target.value })}
                    placeholder="Attribute name (e.g. Lens Color)"
                  />
                  <Input
                    value={a.values}
                    onChange={(e) => updateAttr(i, { values: e.target.value })}
                    placeholder="Values, comma-separated (e.g. Black, Brown)"
                  />
                  <button
                    type="button"
                    onClick={() => setAttrs((prev) => prev.filter((_, j) => j !== i))}
                    disabled={attrs.length === 1}
                    className="rounded-md border border-zinc-200 p-2 text-zinc-400 hover:border-red-300 hover:text-red-500 disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAttrs((prev) => [...prev, { name: "", values: "" }])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark hover:underline"
            >
              <Plus className="h-4 w-4" /> Add attribute
            </button>
          </div>

          <Button type="submit" className="mt-6" loading={saving}>
            {editingId ? "Save changes" : "Create category"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <PlaceholderImage
                  src={c.image}
                  alt={c.name}
                  label={c.name.charAt(0)}
                  className="h-11 w-11 shrink-0 rounded-lg"
                />
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-zinc-400">
                    /{c.slug} · {c.productCount} products · {c.attributes.length} attributes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(c)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-brand hover:text-brand"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(c)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
