# Imágenes

## Logo

| Archivo | Estado | Dónde aparece |
|---|---|---|
| `logoheader.png` | ✅ PNG transparente 1024×1536 | Sello vertical colgando del header, en todas las páginas |
| `koda.png` | ✅ PNG transparente 1080×1080, trazo negro | Sección "Experiencia Roa Brew" |
| `kodaWhite.png` | ✅ PNG transparente 1080×1080, trazo blanco | Sellos de la tarjeta de fidelidad |

**`logoheader.png`** — el sello verde vertical. Se encoge solo al hacer scroll
(160px arriba del todo → 96px con la página desplazada). Si el archivo falta,
el header vuelve al wordmark tipográfico y nada se rompe.

**`koda.png`** — versión negra, para fondos claros. Como ya trae transparencia,
se usa directo, sin trucos de mezcla.

**`kodaWhite.png`** — versión blanca, para fondos oscuros. Es la que se estampa
en cada casilla llena de la tarjeta de fidelidad, tanto en la página pública
como en el panel.

Si algún archivo falta, el sitio cae a una versión vectorial simplificada y
nada se rompe.

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
