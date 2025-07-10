import type { Parametro } from "./parametros";

export interface DatoAmbiental {
  hora: string;
  valor: number;
}

export class SimulacionApi {
  static generarDato(parametro: Parametro): DatoAmbiental {
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);
    const valor = (() => {
      switch (parametro) {
        case "temperature":
          return Math.random() * (40 - 1) + 1;
        case "humidity":
          return Math.random() * 100;
        case "lux":
          return Math.random() * 800;
        case "noise":
          return Math.random() * 80;
        case "airQuality":
          return Math.random() * 100;
        case "all":
        default:
          return Math.random() * 100;
      }
    })();
    return {
      hora,
      valor: parseFloat(valor.toFixed(1)),
    };
  }
}