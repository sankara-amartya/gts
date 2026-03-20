"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { activeMandates, mandateStages } from "@/lib/data"
import { ChartTooltipContent, ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  total: {
    label: "Mandates",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function MandatesChart() {
    const data = mandateStages
    .filter(stage => stage !== 'Closed')
    .map(stage => ({
        name: stage,
        total: activeMandates.filter(mandate => mandate.stage === stage).length,
    }))

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart accessibilityLayer data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
