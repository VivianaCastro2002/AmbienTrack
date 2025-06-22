'use client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { TrendingUp } from "lucide-react"
import { estilosPorParametro } from "@/utils/estilosGraficos"
import { SimulacionApi, DatoAmbiental, Parametro } from "@/utils/simulacionApi"

export default function GraficoGeneral(){
      const [selectedParameter, setSelectedParameter] = useState<Parametro>("all")
      const config = estilosPorParametro[selectedParameter] ?? estilosPorParametro["all"]
     // const datos = chartData[selectedParameter] ?? chartData["all"]

    const [datos, setDatos] = useState<DatoAmbiental[]>([])
    const [loading, setLoading] = useState(true)
 
    useEffect(() => {
    const primerDato = SimulacionApi.generarDato(selectedParameter)
    setDatos([primerDato])
    setLoading(false)

    const intervalo = setInterval(() => {
        setDatos(prev => {
        const nuevo = SimulacionApi.generarDato(selectedParameter)
        const actualizados = [...prev, nuevo]
        return actualizados.length > 10 ? actualizados.slice(-10) : actualizados
        })
    }, 5000)

    return () => clearInterval(intervalo)
    }, [selectedParameter])

      const nombresParametros: Record<string, string> = {
        all: "Ambiente General",
        temperature: "Temperatura",
        humidity: "Humedad",
        light: "Iluminación",
        noise: "Ruido",
        airQuality: "Calidad del Aire"
        }

    const chartConfig = {
    valor: {
        label: "Valor",
    },
    } satisfies ChartConfig

    return(
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between ">
                    <div>
                        <CardTitle className="flex items-center ">
                            <TrendingUp className="h-5 w-5 mr-2"/>
                            {selectedParameter === "all" ? "Vista General del Ambiente" : `Nivel de ${nombresParametros[selectedParameter]}`}
                        </CardTitle>
                        <CardDescription>
                        {selectedParameter === "all"
                            ? "Estado ambiental de la sala en tiempo real"
                            : `Estado actual de ${nombresParametros[selectedParameter]}`}
                        </CardDescription>
                    </div>
                    <Select value={selectedParameter} onValueChange={(value) => setSelectedParameter(value as Parametro)}>

                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar parámetro" />
                        </SelectTrigger>
                    <SelectContent>
                        {Object.entries(nombresParametros).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                        </SelectItem>
                        ))}
                    </SelectContent>                   
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground">Cargando datos simulados...</p>
                ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] max-h-72 w-full">
                    <LineChart
                        accessibilityLayer
                        data={datos}
                        margin={{ left: 0, right: 22 }}
                    >
                    <CartesianGrid vertical horizontal strokeDasharray="3 3"  />
                    <XAxis
                        dataKey="hora"
                        tickLine={false}
                        tickMargin={8}
                        tickFormatter={(value)=> value.slice(0.3)}
                    />
                    <YAxis
                        tickLine={false}
                        tickMargin={8}
                        ticks={config.ticks}
                        tickFormatter={(value) => config.formato?.(value) ?? value}
                            
                    />
                    <ChartTooltip content={<ChartTooltipContent/>}  formatter={(value) => config.formato?(Number(value)) : value} />
                    <ChartLegend content={<ChartLegendContent />} />            
                    <Line
                        dataKey="valor"
                        stroke={config.color}
                        strokeWidth={2}
                        isAnimationActive={false}              
                    />
                    </LineChart>
                </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
