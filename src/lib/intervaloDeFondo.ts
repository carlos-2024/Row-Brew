/**
 * Un intervalo que sigue corriendo con la pestaña de fondo.
 *
 * Los navegadores frenan los `setInterval` de una pestaña oculta: al cabo de
 * cinco minutos solo la despiertan una vez por minuto. Para un aviso de
 * pedidos eso significa enterarse hasta un minuto tarde, justo cuando nadie
 * está mirando la pantalla, que es cuando más falta hace.
 *
 * Los temporizadores de un worker no entran en ese freno, así que el reloj
 * vive ahí y solo avisa al hilo principal. Si el navegador no tiene workers
 * —o los bloquea—, se cae al `setInterval` de siempre: tarde es mejor que
 * nunca.
 */
export function intervaloDeFondo(fn: () => void, ms: number): () => void {
  if (typeof Worker === "undefined") {
    const t = window.setInterval(fn, ms);
    return () => window.clearInterval(t);
  }

  try {
    const codigo = `let t=null;onmessage=e=>{if(e.data==="alto"){clearInterval(t);close();return}t=setInterval(()=>postMessage(0),e.data)}`;
    const url = URL.createObjectURL(new Blob([codigo], { type: "text/javascript" }));
    const w = new Worker(url);
    // El Blob ya está en manos del worker: la URL no hace falta más
    URL.revokeObjectURL(url);

    w.onmessage = () => fn();
    w.postMessage(ms);

    return () => {
      w.postMessage("alto");
      w.terminate();
    };
  } catch {
    const t = window.setInterval(fn, ms);
    return () => window.clearInterval(t);
  }
}
