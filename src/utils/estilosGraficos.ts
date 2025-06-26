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
    ticks: [0, 20, 40, 60, 80, 100],
    formato: (value) => `${value}%`
  },
  temperature: {
    color: "var(--chart-1)",
    ticks: [0, 10, 20, 30, 40, 50],
    formato: (value) => `${value}°C`
  },
  humidity: {
    color: "var(--chart-6)",
    ticks: [0, 20, 40, 60, 80, 100],
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
    ticks: [200, 600, 1000, 1400],
    formato: (value) => `${value} AQI`
  }
}
export { estilosPorParametro}
