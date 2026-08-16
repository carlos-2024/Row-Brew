# Imágenes

## Logo

| Archivo | Estado | Dónde aparece |
|---|---|---|
| `logoheader.png` | ✅ cargado — PNG transparente 1024×1536 | Sello vertical colgando del header, en todas las páginas |
| `koda.jpg` | ✅ cargado — JPEG 1080×1080, fondo blanco | Sección "Experiencia Roa Brew" |

**`logoheader.png`** — el sello verde vertical. Se encoge solo al hacer scroll
(125px arriba del todo → 86px con la página desplazada). Si el archivo falta,
el header vuelve al wordmark tipográfico y nada se rompe.

**`koda.jpg`** — el componente busca primero `koda.png` y después `koda.jpg`.
Como este JPEG tiene fondo blanco, se le aplica `mix-blend-mode: multiply` para
que el blanco desaparezca; por eso hoy solo se usa sobre la sección crema.
**Si consigues el perrito en PNG con transparencia**, guárdalo como `koda.png` y
se usa solo — ahí se puede llevar también a los vasos, al favicon y al header móvil.

## Bebidas

| Archivo | Bebida |
|---|---|
| `matcha-taro.jpg` | Matcha Taro |
| `taro-coffee.jpg` | Taro Coffee |

Son los **posters completos** (con el texto "¡NUEVA BEBIDA!" y el fondo
incrustados), no fotos recortadas del producto. Como miniatura en la carta se
verían pequeñas y con el texto encima, así que esas dos bebidas usan por defecto
la ilustración generada, que justo reproduce sus capas reales (matcha sobre taro
y café sobre taro).

Si recortas el vaso sobre fondo transparente, ponlo acá y asígnalo en
**/admin/productos → editar bebida → URL de la foto**:

```
/img/matcha-taro.jpg
```

Lo mismo para el resto de la carta: sube la foto con un nombre claro
(`sparkling-hawaii.jpg`, `taro-fresita.jpg`…) y pega la ruta en ese campo.
La foto reemplaza a la ilustración de esa bebida.
