"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  LOYALTY_GOAL,
  LOYALTY_MID_GOAL,
  isBirthdayWindow,
  isValidDni,
  isValidPhone,
  normalizeDni,
  parseBirthday,
} from "@/lib/loyalty";
import { toUtcDate } from "@/lib/events";
import type { OrderStatus } from "@prisma/client";

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return session;
}

/**
 * Refresca las pantallas y deja el aviso de que se guardó.
 *
 * El aviso viaja en una cookie de diez segundos y no en el estado de cada
 * formulario: son 27 acciones y todas terminan acá, así que ponerlo en un
 * solo sitio evita tener que acordarse en cada una. La lee el layout del
 * panel en el render siguiente y la borra el propio aviso al desaparecer.
 */
async function refresh(mensaje = "Cambios guardados") {
  const jar = await cookies();
  // Sin httpOnly a propósito: el aviso se borra desde el navegador
  jar.set("roa_flash", mensaje, { path: "/admin", maxAge: 10, sameSite: "lax" });
  revalidatePath("/", "layout");
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string, fallback = 0) => {
  const n = Number(fd.get(key));
  return Number.isFinite(n) ? n : fallback;
};
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/** Genera un slug libre; si ya existe le agrega un sufijo. */
async function uniqueSlug(
  base: string,
  model: "product" | "category",
  ignoreId?: string
): Promise<string> {
  const root = slugify(base) || "item";
  let slug = root;
  let i = 2;

  for (;;) {
    const found =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug } })
        : await prisma.category.findUnique({ where: { slug } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${root}-${i++}`;
  }
}

// ─────────────────────────── Productos ───────────────────────────

export async function saveProduct(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const categoryId = str(formData, "categoryId");
  if (!categoryId) throw new Error("Elige una categoría.");

  const data = {
    name,
    description: str(formData, "description") || null,
    price: num(formData, "price"),
    imageUrl: str(formData, "imageUrl") || null,
    badge: str(formData, "badge") || null,
    size: str(formData, "size") || null,
    featured: bool(formData, "featured"),
    promoEligible: bool(formData, "promoEligible"),
    active: bool(formData, "active"),
    position: num(formData, "position"),
    categoryId,
    allyId: str(formData, "allyId") || null,

    // ── SEO ── vacío significa "arma uno con el nombre y la descripción"
    metaTitle: str(formData, "metaTitle") || null,
    metaDescription: str(formData, "metaDescription") || null,
    seoKeywords: str(formData, "seoKeywords") || null,
    imageAlt: str(formData, "imageAlt") || null,
  };

  // El slug se puede escribir a mano para tener una URL corta y buscada.
  // Se normaliza igual y se comprueba que esté libre: dos productos con el
  // mismo slug harían que uno se coma la página del otro.
  const pedido = str(formData, "slug");

  if (id) {
    const slug = pedido ? await uniqueSlug(pedido, "product", id) : undefined;
    await prisma.product.update({
      where: { id },
      data: slug ? { ...data, slug } : data,
    });
  } else {
    await prisma.product.create({
      data: { ...data, slug: await uniqueSlug(pedido || name, "product") },
    });
  }

  await refresh();
}

export async function deleteProduct(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.product.delete({ where: { id } });
  await refresh("Eliminado");
}

export async function toggleProduct(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  const product = await prisma.product.findUnique({ where: { id } });
  if (product) {
    await prisma.product.update({
      where: { id },
      data: { active: !product.active },
    });
  }
  await refresh("Cambio aplicado");
}

// ─────────────────────────── Categorías ───────────────────────────

export async function saveCategory(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const data = {
    name,
    tagline: str(formData, "tagline") || null,
    description: str(formData, "description") || null,
    kind: str(formData, "kind") || "bebida",
    theme: str(formData, "theme") || "green",
    emoji: str(formData, "emoji") || "🧋",
    position: num(formData, "position"),
    active: bool(formData, "active"),
  };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({
      data: { ...data, slug: await uniqueSlug(name, "category") },
    });
  }

  await refresh();
}

export async function deleteCategory(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(
      `Esta categoría tiene ${count} producto(s). Muévelos o elimínalos primero.`
    );
  }

  await prisma.category.delete({ where: { id } });
  await refresh("Eliminado");
}

// ─────────────────────────── Promos ───────────────────────────

export async function savePromo(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) throw new Error("El título es obligatorio.");

  const data = {
    title,
    label: str(formData, "label") || "2x20",
    detail: str(formData, "detail") || null,
    price: num(formData, "price"),
    quantity: num(formData, "quantity", 2),
    theme: str(formData, "theme") || "purple",
    imageUrl: str(formData, "imageUrl") || null,
    position: num(formData, "position"),
    autoApply: bool(formData, "autoApply"),
    active: bool(formData, "active"),
    categoryId: str(formData, "categoryId") || null,
  };

  // Bebidas que entran en la promo. Sin ninguna marcada entran todas las de
  // la categoría, que es como se comportaba antes de poder elegirlas.
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);

  if (id) {
    await prisma.promo.update({
      where: { id },
      data: { ...data, products: { set: productIds.map((pid) => ({ id: pid })) } },
    });
  } else {
    await prisma.promo.create({
      data: { ...data, products: { connect: productIds.map((pid) => ({ id: pid })) } },
    });
  }

  await refresh();
}

export async function deletePromo(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.promo.delete({ where: { id } });
  await refresh("Eliminado");
}

// ─────────────────────────── Extras ───────────────────────────

export async function saveExtra(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const data = {
    name,
    price: num(formData, "price"),
    active: bool(formData, "active"),
    position: num(formData, "position"),
    // Sin grupo se ofrece en todos los productos, como antes
    groupId: str(formData, "groupId") || null,
  };

  if (id) {
    await prisma.extra.update({ where: { id }, data });
  } else {
    await prisma.extra.create({ data });
  }

  await refresh();
}

export async function deleteExtra(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.extra.delete({ where: { id } });
  await refresh("Eliminado");
}

// ──────────────────── Grupos de opcionales ────────────────────

export async function saveExtraGroup(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre del grupo es obligatorio.");

  const data = {
    name,
    hint: str(formData, "hint") || null,
    // 0 es sin límite; 1 hace que elegir una desmarque la anterior
    maxChoices: Math.max(0, num(formData, "maxChoices")),
    position: num(formData, "position"),
    active: bool(formData, "active"),
  };

  if (id) {
    await prisma.extraGroup.update({ where: { id }, data });
  } else {
    await prisma.extraGroup.create({ data });
  }

  await refresh();
}

export async function deleteExtraGroup(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  // Sus opciones no se borran: quedan sueltas, que es el comportamiento de
  // siempre. Borrarlas en cascada haría desaparecer precios ya configurados
  // por un clic en el grupo equivocado.
  if (id) await prisma.extraGroup.delete({ where: { id } });
  await refresh("Eliminado");
}

/** Qué productos ofrecen este grupo. */
export async function linkExtraGroupProducts(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  if (!id) return;

  const productIds = formData.getAll("productIds").map(String).filter(Boolean);
  await prisma.extraGroup.update({
    where: { id },
    data: { products: { set: productIds.map((pid) => ({ id: pid })) } },
  });

  await refresh(`${productIds.length} productos vinculados`);
}

// ─────────────────────────── Pedidos ───────────────────────────

const VALID_STATUS = [
  "PENDIENTE",
  "CONFIRMADO",
  "PREPARANDO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export async function updateOrderStatus(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const status = str(formData, "status") as OrderStatus;
  if (!id || !VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])) return;

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function deleteOrder(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

// ─────────────────────────── Eventos ───────────────────────────

const ESTADOS_EVENTO = [
  "NUEVA",
  "CONTACTADO",
  "COTIZADO",
  "CONFIRMADO",
  "CERRADO",
  "DESCARTADO",
] as const;

export async function updateEventRequest(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const status = str(formData, "status") as (typeof ESTADOS_EVENTO)[number];
  if (!id || !ESTADOS_EVENTO.includes(status)) return;

  await prisma.eventRequest.update({
    where: { id },
    data: { status, internalNotes: str(formData, "internalNotes") || null },
  });

  revalidatePath("/admin/eventos");
}

export async function deleteEventRequest(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.eventRequest.delete({ where: { id } });
  revalidatePath("/admin/eventos");
}

/** Marca o desmarca un día como no disponible en el calendario público. */
export async function toggleBlockedDate(formData: FormData) {
  await requireSession();

  const date = toUtcDate(str(formData, "date"));
  if (!date) return;

  const existente = await prisma.blockedDate.findUnique({ where: { date } });

  if (existente) {
    await prisma.blockedDate.delete({ where: { id: existente.id } });
  } else {
    await prisma.blockedDate.create({
      data: { date, reason: str(formData, "reason") || null },
    });
  }

  await refresh("Cambio aplicado");
}

// ─────────────────────────── Aliados ───────────────────────────

export async function saveAlly(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const data = {
    name,
    tagline: str(formData, "tagline") || null,
    storyTitle: str(formData, "storyTitle") || null,
    story: str(formData, "story") || null,
    logoUrl: str(formData, "logoUrl") || null,
    coverUrl: str(formData, "coverUrl") || null,
    position: num(formData, "position"),
    active: bool(formData, "active"),

    // ── SEO ── vacío: se arma con el nombre y el tagline
    metaTitle: str(formData, "metaTitle") || null,
    metaDescription: str(formData, "metaDescription") || null,
    seoKeywords: str(formData, "seoKeywords") || null,
    imageAlt: str(formData, "imageAlt") || null,
  };

  if (id) {
    await prisma.ally.update({ where: { id }, data });
  } else {
    await prisma.ally.create({
      data: { ...data, slug: await uniqueAllySlug(name) },
    });
  }

  await refresh();
}

async function uniqueAllySlug(base: string): Promise<string> {
  const root = slugify(base) || "aliado";
  let slug = root;
  let i = 2;
  for (;;) {
    const found = await prisma.ally.findUnique({ where: { slug } });
    if (!found) return slug;
    slug = `${root}-${i++}`;
  }
}

export async function deleteAlly(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;

  const productos = await prisma.product.count({ where: { allyId: id } });
  if (productos > 0) {
    throw new Error(
      `Este aliado tiene ${productos} producto(s). Reasígnalos o elimínalos primero.`
    );
  }

  await prisma.ally.delete({ where: { id } });
  await refresh("Eliminado");
}

export async function addAllyImage(formData: FormData) {
  await requireSession();

  const allyId = str(formData, "allyId");
  const url = str(formData, "url");
  if (!allyId || !url) return;

  const ultima = await prisma.allyImage.findFirst({
    where: { allyId },
    orderBy: { position: "desc" },
  });

  await prisma.allyImage.create({
    data: {
      allyId,
      url,
      caption: str(formData, "caption") || null,
      position: (ultima?.position ?? -1) + 1,
    },
  });

  await refresh();
}

export async function deleteAllyImage(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.allyImage.delete({ where: { id } });
  await refresh("Eliminado");
}

// ─────────────────────────── Fidelidad ───────────────────────────

export async function createLoyaltyCustomer(formData: FormData) {
  await requireSession();

  const dni = normalizeDni(str(formData, "dni"));
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const birthday = parseBirthday(str(formData, "birthday"));

  if (!isValidDni(dni)) throw new Error("Documento inválido (8 a 12 caracteres).");
  if (name.length < 2) throw new Error("El nombre es obligatorio.");
  if (!isValidPhone(phone)) throw new Error("El WhatsApp debe tener 9 dígitos.");
  if (!birthday) throw new Error("La fecha de nacimiento es obligatoria.");

  const existing = await prisma.loyaltyCustomer.findUnique({ where: { dni } });
  if (existing) throw new Error(`Ya existe una tarjeta con el documento ${dni}.`);

  await prisma.loyaltyCustomer.create({
    data: {
      dni,
      name,
      phone,
      birthday,
      notes: str(formData, "notes") || null,
    },
  });

  revalidatePath("/admin/fidelidad");
}

export async function updateLoyaltyCustomer(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  if (!id) return;

  const birthday = parseBirthday(str(formData, "birthday"));

  await prisma.loyaltyCustomer.update({
    where: { id },
    data: {
      name: str(formData, "name"),
      phone: str(formData, "phone") || null,
      notes: str(formData, "notes") || null,
      active: bool(formData, "active"),
      // Solo se pisa si mandaron una fecha válida, para no borrarla sin querer
      ...(birthday ? { birthday } : {}),
    },
  });

  revalidatePath("/admin/fidelidad");
}

/** Canjea la bebida de regalo de cumpleaños. Una vez por año. */
export async function redeemBirthdayReward(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const customer = await prisma.loyaltyCustomer.findUnique({ where: { id } });
  if (!customer) return;

  const year = new Date().getUTCFullYear();
  if (!isBirthdayWindow(customer.birthday) || customer.birthdayRewardYear === year) {
    return;
  }

  await prisma.$transaction([
    prisma.loyaltyCustomer.update({
      where: { id },
      data: { birthdayRewardYear: year },
    }),
    prisma.loyaltyEvent.create({
      data: {
        customerId: id,
        type: "PREMIO_CUMPLE",
        note: `Bebida de cumpleaños ${year}`,
      },
    }),
  ]);

  revalidatePath("/admin/fidelidad");
}

export async function deleteLoyaltyCustomer(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.loyaltyCustomer.delete({ where: { id } });
  revalidatePath("/admin/fidelidad");
}

/** Agrega sellos. La tarjeta se topa en la meta: hay que canjear para seguir. */
export async function addLoyaltyStamp(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const quantity = Math.max(1, Math.min(10, num(formData, "quantity", 1)));

  const customer = await prisma.loyaltyCustomer.findUnique({ where: { id } });
  if (!customer) return;

  // Solo se suma lo que cabe hasta la meta; el resto no se pierde en silencio,
  // simplemente la tarjeta queda llena y el panel avisa que hay que canjear.
  const room = LOYALTY_GOAL - customer.stamps;
  const added = Math.max(0, Math.min(quantity, room));
  if (added === 0) return;

  await prisma.$transaction([
    prisma.loyaltyCustomer.update({
      where: { id },
      data: {
        stamps: { increment: added },
        totalStamps: { increment: added },
      },
    }),
    prisma.loyaltyEvent.create({
      data: { customerId: id, type: "SELLO", quantity: added },
    }),
  ]);

  revalidatePath("/admin/fidelidad");
}

/** Quita un sello, por si se marcó de más. */
export async function removeLoyaltyStamp(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const customer = await prisma.loyaltyCustomer.findUnique({ where: { id } });
  if (!customer || customer.stamps <= 0) return;

  await prisma.$transaction([
    prisma.loyaltyCustomer.update({
      where: { id },
      data: {
        stamps: { decrement: 1 },
        totalStamps: { decrement: customer.totalStamps > 0 ? 1 : 0 },
      },
    }),
    prisma.loyaltyEvent.create({
      data: { customerId: id, type: "AJUSTE", quantity: -1, note: "Sello corregido" },
    }),
  ]);

  revalidatePath("/admin/fidelidad");
}

/** Canjea el premio intermedio: agrandar o bebida de cortesía. */
export async function redeemMidReward(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const customer = await prisma.loyaltyCustomer.findUnique({ where: { id } });
  if (!customer) return;
  if (customer.stamps < LOYALTY_MID_GOAL || customer.midRewardUsed) return;

  await prisma.$transaction([
    prisma.loyaltyCustomer.update({
      where: { id },
      data: { midRewardUsed: true },
    }),
    prisma.loyaltyEvent.create({
      data: {
        customerId: id,
        type: "PREMIO_MEDIO",
        note: "Agrandado o bebida de cortesía",
      },
    }),
  ]);

  revalidatePath("/admin/fidelidad");
}

/** Canjea la bebida gratis y reinicia la tarjeta. */
export async function redeemFullReward(formData: FormData) {
  await requireSession();

  const id = str(formData, "id");
  const customer = await prisma.loyaltyCustomer.findUnique({ where: { id } });
  if (!customer || customer.stamps < LOYALTY_GOAL) return;

  await prisma.$transaction([
    prisma.loyaltyCustomer.update({
      where: { id },
      data: {
        stamps: 0,
        cycles: { increment: 1 },
        midRewardUsed: false,
      },
    }),
    prisma.loyaltyEvent.create({
      data: { customerId: id, type: "PREMIO_COMPLETO", note: "Bebida gratis" },
    }),
  ]);

  revalidatePath("/admin/fidelidad");
}

// ─────────────────────────── Ajustes ───────────────────────────

export async function saveSettings(formData: FormData) {
  await requireSession();

  const entries = [...formData.entries()].filter(
    ([key]) => key !== "$ACTION_ID" && !key.startsWith("$")
  );

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  await refresh();
}
