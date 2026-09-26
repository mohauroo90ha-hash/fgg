"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, ImagePlus, Loader2 } from "lucide-react";
import { slugify } from "@/lib/helpers";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Input";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { MAX_PRODUCT_IMAGES, compressImages } from "@/lib/image";
import type { CategoryWithMeta, ProductWithMeta } from "@/types";

interface VariantRow {
  id: string;
  sku: string;
  price: string;
  stock: string;
  attrs: Record<string, string>;
}

function makeVariant(attrs: Array<{ name: string; values: string[] }>): VariantRow {
  const init: Record<string, string> = {};
  for (const a of attrs) init[a.name] = a.values[0] ?? "";
  return { id: Math.random().toString(36).slice(2), sku: "", price: "", stock: "0", attrs: init };
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryWithMeta[];
  initial?: ProductWithMeta;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    initial ? String(initial.basePrice) : ""
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [keptImages, setKeptImages] = useState<string[]>(initial?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length
      ? initial.variants.map((v) => ({
          id: v.id,
          sku: v.sku ?? "",
          price: String(v.price),
          stock: String(v.stock),
          attrs: v.attributes,
        }))
      : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeAttributes =
    categories.find((c) => c.id === categoryId)?.attributes ?? [];

  useEffect(() => {
    setVariants((prev) =>
      prev.map((v) => {
        const next = { ...v.attrs };
        for (const a of activeAttributes) {
          if (!(a.name in next)) next[a.name] = a.values[0] ?? "";
        }
        return { ...v, attrs: next };
      })
    );
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleName = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const updateVariant = (id: string, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, makeVariant(activeAttributes)]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).filter((f) => f.size > 0);
    if (keptImages.length + newFiles.length + added.length > MAX_PRODUCT_IMAGES) {
      setError(`You can add up to ${MAX_PRODUCT_IMAGES} images per product. Remove some first.`);
      return;
    }
    const compressed = await compressImages(added);
    setNewFiles((prev) => [...prev, ...compressed]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (variants.length === 0) throw new Error("Add at least one variant.");

      const formData = new FormData();
      formData.set("name", name);
      formData.set("slug", slug || slugify(name));
      formData.set("brand", brand);
      formData.set("description", description);
      formData.set("basePrice", basePrice);
      formData.set("categoryId", categoryId);
      formData.set("status", status);
      formData.set("featured", String(featured));
      formData.set("keptImages", JSON.stringify(keptImages));
      formData.set(
        "variants",
        JSON.stringify(
          variants.map((v) => ({
            sku: v.sku,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock, 10) || 0,
            attributes: v.attrs,
          }))
        )
      );
      for (const file of newFiles) formData.append("images", file);

      const res = await fetch(
        isEdit ? `/api/products/${initial!.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          data?.error ||
            (res.status === 413
              ? "Images too large. Please use smaller images."
              : "Failed to save product.")
        );

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Product name *</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => handleName(e.target.value)}
                  placeholder="e.g. Air Runner Pro"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="air-runner-pro"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Stride"
                />
              </div>
              <div>
                <Label htmlFor="basePrice">Base price (PKR) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="129.99"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this product..."
                  rows={4}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold">Variants</h2>
            <p className="mb-4 text-sm text-zinc-500">
              Each variant is a purchasable option (e.g. size 42 / black).
              {activeAttributes.length > 0 &&
                ` Attributes come from the ${categories.find((c) => c.id === categoryId)?.name} category.`}
            </p>

            {variants.length === 0 && (
              <button
                type="button"
                onClick={addVariant}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 py-6 text-sm font-semibold text-zinc-500 transition-colors hover:border-brand hover:text-brand"
              >
                <Plus className="h-4 w-4" /> Add first variant
              </button>
            )}

            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div key={v.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-700">
                      Variant {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(v.id)}
                      className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label>SKU</Label>
                      <Input
                        value={v.sku}
                        onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label>Price (PKR)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, { price: e.target.value })}
                        placeholder="129.99"
                      />
                    </div>
                    <div>
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        required
                        value={v.stock}
                        onChange={(e) => updateVariant(v.id, { stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {activeAttributes.length > 0 && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {activeAttributes.map((a) => (
                        <div key={a.id}>
                          <Label>{a.name}</Label>
                          {a.values.length > 0 ? (
                            <Select
                              value={v.attrs[a.name] ?? ""}
                              onChange={(e) =>
                                updateVariant(v.id, {
                                  attrs: { ...v.attrs, [a.name]: e.target.value },
                                })
                              }
                            >
                              {a.values.map((val) => (
                                <option key={val} value={val}>
                                  {val}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            <Input
                              value={v.attrs[a.name] ?? ""}
                              onChange={(e) =>
                                updateVariant(v.id, {
                                  attrs: { ...v.attrs, [a.name]: e.target.value },
                                })
                              }
                              placeholder={a.name}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {variants.length > 0 && (
              <button
                type="button"
                onClick={addVariant}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand hover:text-brand"
              >
                <Plus className="h-4 w-4" /> Add variant
              </button>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold">Images</h2>
            <div className="grid grid-cols-2 gap-3">
              {keptImages.map((img) => (
                <div key={img} className="relative">
                  <PlaceholderImage
                    src={img}
                    alt="Product"
                    className="aspect-square rounded-lg border border-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={() => setKeptImages((prev) => prev.filter((i) => i !== img))}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {newFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="aspect-square w-full rounded-lg border border-zinc-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <label
              className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 py-4 text-sm font-semibold text-zinc-500 transition-colors hover:border-brand hover:text-brand ${
                keptImages.length + newFiles.length >= MAX_PRODUCT_IMAGES
                  ? "pointer-events-none opacity-40"
                  : ""
              }`}
            >
              <ImagePlus className="h-4 w-4" /> Upload images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            <p className="mt-2 text-xs text-zinc-400">
              JPG, PNG, WebP. Up to {MAX_PRODUCT_IMAGES} images, resized
              automatically. {keptImages.length + newFiles.length}/
              {MAX_PRODUCT_IMAGES} used.
            </p>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold">Visibility</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                </Select>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className="text-sm font-medium">Feature on homepage</span>
              </label>
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full" loading={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>{isEdit ? "Save changes" : "Create product"}</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
