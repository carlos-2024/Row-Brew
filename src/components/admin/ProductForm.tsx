import { redirect } from "next/navigation";
import { saveProduct } from "@/app/admin/actions";
import { Button, Field, LinkButton, Panel, Toggle, inputClass } from "./ui";
import { toNumber } from "@/lib/format";
import ProductPreview from "./ProductPreview";

type Category = { id: string; name: string; slug: string; emoji: string; kind: string };
type Subcategory = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: unknown;
  imageUrl: string | null;
  badge: string | null;
  size: string | null;
  featured: boolean;
  promoEligible: boolean;
  active: boolean;
  position: number;
  categoryId: string;
  allyId: string | null;
  subcategoryId: string | null;
  temperature: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  seoKeywords: string | null;
  imageAlt: string | null;
};

type Ally = { id: string; name: string };

export default function ProductForm({
  categories,
  subcategories = [],
  allies = [],
  product,
}: {
  categories: Category[];
  subcategories?: Subcategory[];
  allies?: Ally[];
  product?: Product;
}) {
  async function action(formData: FormData) {
    "use server";
    await saveProduct(formData);
    redirect("/admin/productos");
  }

  const current =
    categories.find((c) => c.id === product?.categoryId) ?? categories[0];

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Panel title={product ? "Editar producto" : "Nuevo producto"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" className="sm:col-span-2">
            <input
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Sparkling Hawaii"
              className={inputClass}
            />
          </Field>

          <Field label="Descripción" className="sm:col-span-2">
            <textarea
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              placeholder="Té verde con jarabe de piña + mango + maracuyá…"
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Precio (S/)">
            <input
              name="price"
              type="number"
              step="0.5"
              min="0"
              required
              defaultValue={product ? toNumber(product.price as number) : 12}
              className={inputClass}
            />
          </Field>

          <Field label="Categoría">
            <select
              name="categoryId"
              defaultValue={product?.categoryId ?? categories[0]?.id}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subcategoría" hint="opcional">
            <select
              name="subcategoryId"
              defaultValue={product?.subcategoryId ?? ""}
              className={inputClass}
            >
              <option value="">Sin subcategoría</option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Radios y no desplegable: son dos opciones y así se ven las dos sin
              abrir nada, que es lo que se quiere al comparar la vista previa */}
          <Field label="Temperatura">
            <div className="flex gap-2">
              {[
                { value: "frio", label: "Frío" },
                { value: "caliente", label: "Caliente" },
              ].map((t) => (
                <label key={t.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="temperature"
                    value={t.value}
                    defaultChecked={(product?.temperature ?? "frio") === t.value}
                    className="peer sr-only"
                  />
                  <span className="block rounded-xl border-2 border-cream/15 px-3 py-2.5 text-center text-sm font-bold text-cream/60 transition peer-checked:border-roa-500 peer-checked:bg-roa-500/20 peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-roa-300">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Tamaño" hint="Opcional: 16oz, 12oz…">
            <input
              name="size"
              defaultValue={product?.size ?? ""}
              placeholder="16oz"
              className={inputClass}
            />
          </Field>

          <Field label="Etiqueta">
            <select
              name="badge"
              defaultValue={product?.badge ?? ""}
              className={inputClass}
            >
              <option value="">Sin etiqueta</option>
              <option value="nuevo">NUEVO</option>
              <option value="estrella">★ TOP</option>
            </select>
          </Field>

          <Field
            label="URL de la foto"
            className="sm:col-span-2"
            hint="Déjalo vacío y usamos la ilustración generada automáticamente."
          >
            <input
              name="imageUrl"
              defaultValue={product?.imageUrl ?? ""}
              placeholder="https://… o /img/mi-producto.png"
              className={inputClass}
            />
          </Field>

          <Field label="Orden" hint="Menor número = aparece primero">
            <input
              name="position"
              type="number"
              defaultValue={product?.position ?? 0}
              className={inputClass}
            />
          </Field>

          <Field
            label="Marca aliada"
            hint="Si eliges una, el producto sale en la sección de aliados y NO en la carta."
          >
            <select
              name="allyId"
              defaultValue={product?.allyId ?? ""}
              className={inputClass}
            >
              <option value="">Producto propio de Roa Brew</option>
              {allies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
            <Toggle
              name="active"
              label="Visible en la carta"
              defaultChecked={product?.active ?? true}
            />
            <Toggle
              name="featured"
              label="Destacado en la home"
              defaultChecked={product?.featured ?? false}
            />
            <Toggle
              name="promoEligible"
              label="Entra en la promo"
              defaultChecked={product?.promoEligible ?? true}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="primary">
            {product ? "Guardar cambios" : "Crear bebida"}
          </Button>
          <LinkButton href="/admin/productos" variant="ghost">
            Cancelar
          </LinkButton>
        </div>
      </Panel>

      {/* Solo para administración: nada de esto se le muestra al cliente,
          solo a los buscadores. */}
      <Panel title="SEO">
        <p className="-mt-2 mb-4 text-sm text-cream/45">
          Lo que ve Google, aparte de lo que ve el cliente. Déjalo vacío y se arma
          solo con el nombre y la descripción de arriba.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Meta title"
            className="sm:col-span-2"
            hint="hasta 60 caracteres · Google recorta lo que sobra"
          >
            <input
              name="metaTitle"
              defaultValue={product?.metaTitle ?? ""}
              maxLength={70}
              placeholder={`${product?.name ?? "Nombre"} | Roa Brew Los Olivos`}
              className={inputClass}
            />
          </Field>

          <Field
            label="Meta description"
            className="sm:col-span-2"
            hint="hasta 155 caracteres · es el texto bajo el título en el buscador"
          >
            <textarea
              name="metaDescription"
              defaultValue={product?.metaDescription ?? ""}
              rows={2}
              maxLength={200}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field
            label="Slug / URL amigable"
            hint={`roabrew.com/producto/${product?.slug ?? "..."}`}
          >
            <input
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="se genera del nombre"
              className={inputClass}
            />
          </Field>

          <Field label="SEO keywords" hint="separadas por coma · opcional">
            <input
              name="seoKeywords"
              defaultValue={product?.seoKeywords ?? ""}
              placeholder="matcha lima, matcha los olivos"
              className={inputClass}
            />
          </Field>

          <Field
            label="Alt text de imagen"
            className="sm:col-span-2"
            hint="describe la foto: lo leen Google y los lectores de pantalla"
          >
            <input
              name="imageAlt"
              defaultValue={product?.imageAlt ?? ""}
              placeholder={`Vaso de ${product?.name ?? "la bebida"} de Roa Brew`}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="primary">Guardar SEO</Button>
        </div>
      </Panel>

      <Panel title="Vista previa">
        <ProductPreview
          categories={categories.map((c) => ({ id: c.id, slug: c.slug, kind: c.kind }))}
          initial={{
            name: product?.name ?? "",
            categoryId: product?.categoryId ?? current?.id ?? "",
            temperature: product?.temperature ?? "frio",
            imageUrl: product?.imageUrl ?? "",
          }}
        />
      </Panel>
    </form>
  );
}
