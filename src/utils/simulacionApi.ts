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
export function obtenerEstadoParametro(parametro: Parametro, valor: number): string {
  switch (parametro) {
    case "temperature":
      if (valor < 10) return "Muy Bajo"
      if (valor < 18) return "Bajo"
      if (valor > 28) return "Alto" //
      if (valor > 35) return "Muy Alto" //
      return "Normal"

    case "humidity":
      if (valor < 15) return "Muy Bajo"
      if (valor < 30) return "Bajo" //
      if (valor > 70) return "Alto" //   
      if (valor > 85) return "Muy Alto" //
      return "Normal"

    case "light":
      if (valor < 150) return "Muy Bajo"
      if (valor < 300) return "Bajo" //
      if (valor > 700) return "Alto" //
      if (valor > 850) return "Muy Alto" //
      return "Normal"

    case "noise":
      if (valor > 65) return "Muy alto"
      if (valor > 45) return "Alto"
      return "Normal"

    case "airQuality":
      if (valor > 75) return "Muy bajo"
      if (valor > 50) return "Bajo"
      return "Normal"

    case "all":
    default:
      if (valor > 75) return "Alerta"
      if (valor < 25) return "Bajo"
      return "Estable"
  }
}





