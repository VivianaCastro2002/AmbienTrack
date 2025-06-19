'use client'
import { useState } from "react"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Divide, TrendingUp } from "lucide-react"
export default function GraficoGeneral(){
      const [selectedParameter, setSelectedParameter] = useState<string>("all")

      const chartData = [
        { hora: "20:01", valor: 86 },
        { hora: "20:02", valor: 95 },
        { hora: "20:03", valor: 37 },
        { hora: "20:04", valor: 73 },
        { hora: "20:05", valor: 9 },
        { hora: "20:06", valor: 14 },
        { hora: "20:07", valor: 21 },
        { hora: "20:08", valor: 14 },
        { hora: "20:09", valor: 24 },
        { hora: "20:10", valor: 24 },
        ]

    const chartConfig = {
    valor: {
        label: "Valor",
    },
    } satisfies ChartConfig

    return(
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            {selectedParameter === "all" ? "Vista General del Ambiente" : "Evolución Temporal"}
                        </CardTitle>
                        <CardDescription>
                        {selectedParameter === "all"
                            ? "Estado actual de todos los parámetros ambientales"
                            : `Evolución del parámetro seleccionado durante el día`}
                        </CardDescription>
                    </div>
                    <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar parámetro" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Vista General</SelectItem>
                        <SelectItem value="temperature">Temperatura</SelectItem>
                        <SelectItem value="humidity">Humedad</SelectItem>
                        <SelectItem value="light">Iluminación</SelectItem>
                        <SelectItem value="noise">Ruido</SelectItem>
                        <SelectItem value="airQuality">Calidad del Aire</SelectItem>
                        </SelectContent>                    
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                        left: 0,
                        right: 22,
                        }}
                        >
                        <CartesianGrid vertical={true} horizontal={true} strokeDasharray="3 3"  />
                        <XAxis
                            dataKey="hora"
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value)=> value.slice(0.3)}
                        />
                        <YAxis
                            tickLine={false}
                            tickMargin={8}
                            ticks={[0, 25, 50, 75, 100]}
                            tickFormatter={(value) => `${value}%`}
                            
                            />
                        <ChartTooltip content={<ChartTooltipContent/>}  formatter={(value) => `${value}%`} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        <Line
                            dataKey="valor"
                            stroke="var(--chart-9)"
                            strokeWidth={2}              
                        />

                    </LineChart>
            
                </ChartContainer>


            </CardContent>

        </Card>
    )
}