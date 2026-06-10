'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinance } from '@/lib/FinanceContext'
import { formatCurrency } from '@/lib/constants'

const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

function StatCard({ label, amount, color, bg }: { label: string; amount: number; color: string; bg: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex-1"
      style={{ background: bg, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <p className="text-[12px] font-[500] uppercase tracking-[0.05em]" style={{ color: '#6B7280' }}>{label}</p>
      <p className="text-[22px] font-[700] mt-1" style={{ color }}>{formatCurrency(amount)}</p>
    </div>
  )
}

export default function MonthlyPage() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { transactions } = useFinance()

  const prefix   = `${year}-${String(month).padStart(2, '0')}`
  const monthTxs = transactions.filter(t => t.date.startsWith(prefix))
  const income   = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense  = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net      = income - expense

  const catMap: Record<string, { name: string; icon: string; color: string; total: number }> = {}
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    const key = t.category_id ?? '__other'
    if (!catMap[key]) catMap[key] = { name: t.category?.name ?? 'อื่นๆ', icon: t.category?.icon ?? '📦', color: t.category?.color ?? '#888', total: 0 }
    catMap[key].total += t.amount
  })
  const catData  = Object.values(catMap).sort((a, b) => b.total - a.total)
  const maxTotal = catData[0]?.total ?? 1

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-[20px] font-[600] text-[#111827]">รายเดือน</h1>

      {/* Month nav */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:bg-[#F3F4F6]"
          style={{ borderColor: '#E5E7EB', background: '#FFFFFF' }}
        >
          <ChevronLeft size={16} strokeWidth={2} className="text-[#6B7280]" />
        </button>
        <span className="text-[16px] font-[600] text-[#111827] min-w-[180px] text-center">
          {TH_MONTHS[month - 1]} {year + 543}
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:bg-[#F3F4F6]"
          style={{ borderColor: '#E5E7EB', background: '#FFFFFF' }}
        >
          <ChevronRight size={16} strokeWidth={2} className="text-[#6B7280]" />
        </button>
      </div>

      {/* Stat row */}
      <div className="flex gap-4">
        <StatCard label="รายรับ"  amount={income}  color="#16A34A" bg="#F0FDF4" />
        <StatCard label="รายจ่าย" amount={expense} color="#DC2626" bg="#FEF2F2" />
        <StatCard
          label="คงเหลือ"
          amount={Math.abs(net)}
          color={net >= 0 ? '#16A34A' : '#DC2626'}
          bg={net >= 0 ? '#F0FDF4' : '#FEF2F2'}
        />
        {/* Savings card */}
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-3"
          style={{ background: '#FFFBEB', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <span className="text-[28px]">🐷</span>
          <div>
            <p className="text-[12px] font-[500] uppercase tracking-[0.05em] text-[#6B7280]">ออมได้เดือนนี้</p>
            <p className="text-[20px] font-[700] mt-0.5" style={{ color: net >= 0 ? '#D97706' : '#DC2626' }}>
              {net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(net))}
            </p>
          </div>
        </div>
      </div>

      {/* Bar chart card */}
      <div
        className="rounded-xl p-6"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <p className="text-[14px] font-[600] text-[#111827] mb-5">ค่าใช้จ่ายแยกตามหมวด</p>

        {catData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <span className="text-[40px]">📊</span>
            <p className="text-[14px] text-[#9CA3AF]">ไม่มีรายจ่ายเดือนนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {catData.map((cat, i) => (
              <div key={i} className="flex items-center gap-4">
                {/* Icon */}
                <span className="text-[18px] w-6 text-center shrink-0">{cat.icon}</span>
                {/* Name */}
                <span className="text-[13px] font-[500] text-[#374151] w-24 shrink-0 truncate">{cat.name}</span>
                {/* Bar track */}
                <div className="flex-1 h-2 rounded-full" style={{ background: '#F3F4F6' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.total / maxTotal) * 100}%`,
                      background: '#6366F1',
                    }}
                  />
                </div>
                {/* Amount */}
                <span
                  className="text-[13px] font-[600] w-28 text-right shrink-0"
                  style={{ color: '#DC2626' }}
                >
                  {formatCurrency(cat.total)}
                </span>
                {/* Percent */}
                <span className="text-[12px] text-[#9CA3AF] w-10 text-right shrink-0">
                  {((cat.total / (expense || 1)) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
