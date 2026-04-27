import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LabelList,
} from 'recharts'
import { useCollectionItems } from '@/hooks/useCollection'
import { TrendingUp, TrendingDown, Package, DollarSign, Download } from 'lucide-react'
import type { CollectionItem } from '@/types/collection'

function exportToCSV(items: CollectionItem[]) {
  const headers = ['Nombre','Categoría','Marca','Subcategoría','Condición',
                   'Precio compra','Valor estimado','Año adquisición','Mes adquisición','Notas']
  const rows = items.map(item => [
    item.name, item.category, item.brand, item.subcategory, item.condition,
    item.acquisition_price ?? '', item.estimated_value ?? '',
    item.acquisition_year ?? '', item.acquisition_month ?? '', item.notes ?? '',
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `coleccion-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
import { cn } from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  figures: '#3b82f6', headphones: '#8b5cf6',
  vinyls: '#f97316', lego: '#eab308', perfumes: '#ec4899',
}
const CATEGORY_LABEL: Record<string, string> = {
  figures: 'Figuras', headphones: 'Audífonos',
  vinyls: 'Vinilos', lego: 'LEGO', perfumes: 'Perfumes',
}
const CONDITION_COLOR: Record<string, string> = {
  sealed: '#a855f7', mint: '#22c55e',
  near_mint: '#3b82f6', good: '#eab308', fair: '#ef4444',
}
const CONDITION_LABEL: Record<string, string> = {
  sealed: 'Sealed', mint: 'Mint',
  near_mint: 'Near Mint', good: 'Good', fair: 'Fair',
}

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

const fmtK = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`

// ─── Tooltip personalizado ────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border rounded-lg px-3 py-2 text-sm shadow-lg">
      {label && <p className="font-semibold mb-1 text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }}>
          {p.name}: <span className="font-medium">
            {typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-card border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="text-foreground">{d.value} {d.value === 1 ? 'ítem' : 'ítems'}</p>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, positive, color }: {
  label: string; value: string; sub?: string
  icon: React.ElementType; positive?: boolean; color?: string
}) {
  return (
    <div className="border rounded-xl p-5 bg-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="p-2 rounded-lg bg-muted">
          <Icon size={16} className="text-muted-foreground" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={color ? { color } : {}}>{value}</p>
      {sub && (
        <p className={cn('text-xs font-medium',
          positive === undefined ? 'text-muted-foreground'
            : positive ? 'text-green-600' : 'text-red-500')}>
          {sub}
        </p>
      )}
    </div>
  )
}

function ChartCard({ title, children, className }: {
  title: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('border rounded-xl p-6 bg-card space-y-4', className)}>
      <h3 className="font-semibold text-base">{title}</h3>
      {children}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { data: items = [], isLoading } = useCollectionItems()

  const stats = useMemo(() => {
    const totalItems     = items.length
    const totalInvested  = items.reduce((s, i) => s + (i.acquisition_price ?? 0), 0)
    const totalEstimated = items.reduce((s, i) => s + (i.estimated_value ?? 0), 0)
    const difference     = totalEstimated - totalInvested

    const byCategory = Object.entries(
      items.reduce<Record<string, number>>((acc, i) => {
        acc[i.category] = (acc[i.category] ?? 0) + 1; return acc
      }, {})
    ).map(([k, v]) => ({ name: CATEGORY_LABEL[k] ?? k, value: v, color: CATEGORY_COLOR[k] ?? '#94a3b8' }))

    const byCondition = Object.entries(
      items.reduce<Record<string, number>>((acc, i) => {
        acc[i.condition] = (acc[i.condition] ?? 0) + 1; return acc
      }, {})
    ).map(([k, v]) => ({ name: CONDITION_LABEL[k] ?? k, value: v, color: CONDITION_COLOR[k] ?? '#94a3b8' }))

    const byYear = Object.entries(
      items.reduce<Record<string, number>>((acc, i) => {
        if (i.acquisition_year && i.acquisition_price)
          acc[i.acquisition_year] = (acc[i.acquisition_year] ?? 0) + i.acquisition_price
        return acc
      }, {})
    ).sort(([a], [b]) => Number(a) - Number(b))
      .map(([name, value]) => ({ name, value: Math.round(value) }))

    const topBrands = Object.entries(
      items.reduce<Record<string, number>>((acc, i) => {
        const k = i.brand || i.subcategory
        if (k) acc[k] = (acc[k] ?? 0) + 1
        return acc
      }, {})
    ).sort(([, a], [, b]) => b - a).slice(0, 8)
      .map(([name, value]) => ({ name, value }))
      .reverse()

    const invVsEst = Object.entries(
      items.reduce<Record<string, { inv: number; est: number }>>((acc, i) => {
        if (!acc[i.category]) acc[i.category] = { inv: 0, est: 0 }
        acc[i.category].inv += i.acquisition_price ?? 0
        acc[i.category].est += i.estimated_value ?? 0
        return acc
      }, {})
    ).filter(([, v]) => v.inv > 0 || v.est > 0)
      .map(([k, v]) => ({
        name: CATEGORY_LABEL[k] ?? k,
        Invertido: Math.round(v.inv),
        Estimado: Math.round(v.est),
      }))

    return { totalItems, totalInvested, totalEstimated, difference, byCategory, byCondition, byYear, topBrands, invVsEst }
  }, [items])

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground space-y-2">
        <Package size={48} className="opacity-20" />
        <p className="text-lg font-medium">Aún no hay datos para mostrar</p>
        <p className="text-sm">Agrega ítems a tu colección para ver las estadísticas.</p>
      </div>
    )
  }

  const diffPositive = stats.difference >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estadísticas</h2>
        <button
          onClick={() => exportToCSV(items)}
          className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors text-muted-foreground"
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total ítems"     value={String(stats.totalItems)}  icon={Package} />
        <StatCard label="Total invertido" value={fmt(stats.totalInvested)}  icon={DollarSign} />
        <StatCard label="Valor estimado"  value={fmt(stats.totalEstimated)} icon={TrendingUp} />
        <StatCard
          label="Diferencia"
          value={fmt(Math.abs(stats.difference))}
          sub={diffPositive ? '▲ Apreciación' : '▼ Depreciación'}
          icon={diffPositive ? TrendingUp : TrendingDown}
          positive={diffPositive}
          color={diffPositive ? '#16a34a' : '#dc2626'}
        />
      </div>

      {/* ── Donuts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Ítems por categoría">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.byCategory}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value"
                animationBegin={0} animationDuration={600}
              >
                {stats.byCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Condición de la colección">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.byCondition}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value"
                animationBegin={0} animationDuration={600}
              >
                {stats.byCondition.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Gasto por año ── */}
      {stats.byYear.length > 0 && (
        <ChartCard title="Gasto por año de adquisición">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byYear} margin={{ top: 20, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="value" name="Gasto" fill="#3b82f6" radius={[6, 6, 0, 0]} animationDuration={600}>
                <LabelList dataKey="value" position="top" formatter={fmtK} style={{ fontSize: 10, fill: '#94a3b8' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Top marcas + Invertido vs Estimado ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.topBrands.length > 0 && (
          <ChartCard title="Top marcas / líneas">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topBrands} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Ítems" fill="#8b5cf6" radius={[0, 6, 6, 0]} animationDuration={600}>
                  <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: '#94a3b8' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {stats.invVsEst.length > 0 && (
          <ChartCard title="Invertido vs valor estimado">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.invVsEst} margin={{ top: 20, right: 20, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
                <Bar dataKey="Invertido" fill="#f97316" radius={[6, 6, 0, 0]} animationDuration={500} />
                <Bar dataKey="Estimado"  fill="#22c55e" radius={[6, 6, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
