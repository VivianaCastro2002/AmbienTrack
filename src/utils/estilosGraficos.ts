const estilosPorParametro: Record<
  string,
  {
    color: string
    ticks: number[]
    formato?: (value: number) => string
  }
> = {
  all: {
    color: "var(--chart-9)",
    ticks: [0, 25, 50, 75, 100],
    formato: (value) => `${value}%`
  },
  temperature: {
    color: "var(--chart-1)",
    ticks: [10, 15, 20, 25, 30, 40],
    formato: (value) => `${value}°C`
  },
  humidity: {
    color: "var(--chart-6)",
    ticks: [0, 25, 50, 75, 100],
    formato: (value) => `${value}%`
  },
  light: {
    color: "var(--chart-5)",
    ticks: [0, 200, 400, 600, 800],
    formato: (value) => `${value} lx`
  },
  noise: {
    color: "var(--chart-2)",
    ticks: [0, 20, 40, 60, 80],
    formato: (value) => `${value} dB`
  },
  airQuality: {
    color: "var(--chart-7)",
    ticks: [0, 25, 50, 75, 100],
    formato: (value) => `${value} AQI`
  }
}
export { estilosPorParametro}
