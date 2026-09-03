import { redirect } from "next/navigation";
import { saveProduct } from "@/app/admin/actions";
import { Button, Field, LinkButton, Panel, Toggle, inputClass } from "./ui";
import { toNumber } from "@/lib/format";
import CupArt from "@/components/CupArt";

type Category = { id: string; name: string; slug: string; emoji: string };

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
};

type Ally = { id: string; name: string };

export default function ProductForm({
  categories,
  allies = [],
  product,
}: {
  categories: Category[];
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

      <Panel title="Vista previa">
        <div className="grid place-items-center rounded-3xl bg-gradient-to-b from-roa-200 to-roa-100 py-8">
          <CupArt
            name={product?.name ?? "Sparkling Hawaii"}
            categorySlug={current?.slug ?? "sparkling-tea"}
            className="h-52"
          />
        </div>
        <p className="mt-4 text-sm text-cream/45">
          La ilustración se genera a partir del nombre y la categoría: si el nombre
          menciona mango, fresa, taro o matcha, los colores del vaso cambian solos.
          Cuando cargues una foto real, la reemplaza.
        </p>
      </Panel>
    </form>
  );
}
