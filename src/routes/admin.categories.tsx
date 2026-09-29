import { useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShop } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const blank = (): Category => ({
  id: `cat_${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function AdminCategories() {
  const { categories, saveCategory, deleteCategory } = useShop();
  const [draft, setDraft] = useState<Category | null>(null);

  const chooseImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result || "");
      setDraft({
        ...draft,
        image,
      });
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    saveCategory({
      ...draft,
      slug: draft.slug || slugify(draft.name),
      updatedAt: new Date().toISOString(),
    });
    toast.success("Category saved");
    setDraft(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} total</p>
        </div>
        <Button onClick={() => setDraft(blank())}>Add category</Button>
      </div>

      {draft && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-border bg-background p-5 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-slug">Slug</Label>
            <Input
              id="c-slug"
              value={draft.slug}
              placeholder={slugify(draft.name)}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="c-img">Image URL</Label>
            <Input
              id="c-img"
              value={draft.image}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              placeholder="https://example.com/garimaa-category.jpg"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="c-image-file">Select image from PC or mobile</Label>
            <Input
              id="c-image-file"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={chooseImage}
            />
            {draft.image && (
              <img
                src={draft.image}
                alt={draft.name || "Category preview"}
                className="mt-3 h-32 w-full rounded-sm object-cover"
              />
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-background p-4">
            {c.image && (
              <img
                src={c.image}
                alt={c.name}
                className="mb-3 h-28 w-full rounded-sm object-cover"
              />
            )}
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">/{c.slug}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setDraft(c)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  deleteCategory(c.id);
                  toast.success("Category deleted");
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
