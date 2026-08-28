/**
 * Modo lanzamiento.
 *
 * Mientras está activo, el público solo ve la pantalla de "muy pronto". El
 * equipo entra por una ruta secreta que deja una cookie de acceso.
 *
 * Se controla con una variable de entorno y no con un ajuste de la base
 * porque el middleware corre en el runtime Edge, donde no hay acceso a Prisma.
 */

export const PREVIEW_COOKIE = "roa_preview";

/** Ruta secreta que habilita la vista previa. */
export const PREVIEW_PATH = "/roaTest2026";

/** 30 días de acceso antes de tener que volver a entrar por la ruta. */
export const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30;

export function comingSoonEnabled(): boolean {
  const flag = process.env.COMING_SOON?.trim().toLowerCase();
  return flag === "true" || flag === "1";
}
