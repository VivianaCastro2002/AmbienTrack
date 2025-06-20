export type Parametro =
  | "temperature"
  | "humidity"
  | "light"
  | "noise"
  | "airQuality"
  | "all"

export interface DatoAmbiental {
  hora: string
  valor: number
}

export class SimulacionApi {
  /**
   * Genera un dato ambiental aleatorio según el tipo de parámetro.
   * @param parametro Nombre del parámetro ambiental.
   * @returns Un objeto con la hora actual y un valor simulado.
   */
  static generarDato(parametro: Parametro): DatoAmbiental {
    const now = new Date()
    const hora = now.toTimeString().slice(0, 5) // Formato HH:MM

    const valor = (() => {
      switch (parametro) {
        case "temperature":
          return Math.random() * (40 - 1) + 1 // 18°C a 30°C
        case "humidity":
          return Math.random() * 100 // 0% a 100%
        case "light":
          return Math.random() * 800 // 0 a 800 lux
        case "noise":
          return Math.random() * 80 // 0 a 80 dB
        case "airQuality":
          return Math.random() * 100 // 0 a 100 AQI
        case "all":
        default:
          return Math.random() * 100 // % general
      }
    })()

    return {
      hora,
      valor: parseFloat(valor.toFixed(1)) // Limita a 1 decimal
    }
  }
}
