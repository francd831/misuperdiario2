# Base de experiencia móvil infantil

Esta guía define las reglas que deben compartir el recibidor, los mundos y las siete zonas funcionales. Las ilustraciones se adaptan al sistema de interacción, no al contrario.

## Criterios obligatorios

- La aplicación se diseña y prueba en horizontal.
- El mundo entra con el mayor encuadre disponible y el zoom mínimo calculado para el dispositivo.
- Un dedo desplaza el escenario desde cualquier punto, también sobre una zona interactiva.
- Dos dedos amplían o reducen manteniendo el punto medio del gesto como ancla.
- Un desplazamiento superior a 6 px se interpreta como arrastre y cancela la navegación del toque.
- Las acciones principales tienen un área táctil mínima de 52 por 52 px CSS.
- Ninguna acción imprescindible depende exclusivamente de texto pequeño incrustado en una ilustración.
- Las acciones destructivas requieren confirmación y ofrecen recuperación cuando sea posible.
- Los paneles funcionales pueden desplazarse internamente sin ocultar su acción principal.
- La interfaz respeta las áreas seguras del dispositivo.

## Matriz de referencia

| Categoría | Tamaño horizontal de referencia | Objetivo |
| --- | ---: | --- |
| Móvil pequeño | 640 x 360 | Funcional sin controles cortados |
| Móvil habitual | 844 x 390 | Experiencia táctil principal |
| Móvil panorámico | 915 x 412 | Sin estirar controles ni perder zonas |
| Tablet compacta | 1024 x 600 | Más contexto sin reducir objetivos táctiles |
| Tablet grande | 1280 x 800 | Más escenario, no una interfaz sobredimensionada |

## Arquitectura

`useWorldCamera` es la fuente común para encaje, foco, desplazamiento, pellizco y diferenciación entre toque y arrastre. Cada mundo solo debe declarar su imagen, proporción, foco inicial, destinos, límites y obstáculos.

Las pantallas de vídeo, voz, escritura, foto, tienda, histórico y ajustes deberán adoptar esta base o una variante estática del mismo contrato durante las siguientes fases.
