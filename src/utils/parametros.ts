export type Parametro =
  | "temperature"
  | "humidity"
  | "light"
  | "noise"
  | "airQuality"
  | "all";

export const NOMBRES_PARAMETROS: Record<Parametro, string> = {
  temperature: "Temperatura",
  humidity: "Humedad",
  light: "Iluminación",
  noise: "Ruido",
  airQuality: "Calidad de aire",
  all: "Ambiente General",
};

export function obtenerEstadoParametro(parametro: Parametro, valor: number): string {
  switch (parametro) {
    case "temperature":
      if (valor < 10) return "Muy Baja";
      if (valor < 18) return "Baja";
      if (valor > 35) return "Muy Alta";
      if (valor > 28) return "Alta";
      return "Normal";
    case "humidity":
      if (valor < 15) return "Muy Baja";
      if (valor < 30) return "Baja";
      if (valor > 85) return "Muy Alta";
      if (valor > 70) return "Alta";
      return "Normal";
    case "light":
      if (valor < 150) return "Muy Baja";
      if (valor < 300) return "Baja";
      if (valor > 850) return "Muy Alta";
      if (valor > 700) return "Alta";
      return "Normal";
    case "noise":
      if (valor > 400) return "Muy Alta";
      if (valor > 200) return "Alta";
      return "Normal";
    case "airQuality":
      if (valor > 750) return "Muy Baja";
      if (valor > 1250) return "Baja";
      return "Normal";
    default:
      return "Normal";
  }
}

export function obtenerEstrato(estado: string): 3 | 2 | 1 {
  const e = estado.trim().toLowerCase();
  if (e === "normal") return 3;
  if (e === "alto" || e === "bajo") return 2;
  if (e.startsWith("muy")) return 1;
  return 3;
}

export function calcularCondicionGeneral(valores: Record<Parametro, number>): number {
  const estratos = Object.entries(valores)
    .filter(([param]) => param !== "all")
    .map(([param, valor]) => {
      const estado = obtenerEstadoParametro(param as Parametro, valor);
      return obtenerEstrato(estado);
    });
  const suma = estratos.reduce((acc, e) => acc + e, 0);
  const promedio = estratos.length > 0 ? suma / estratos.length : 3;
  return Number(promedio.toFixed(2));
}