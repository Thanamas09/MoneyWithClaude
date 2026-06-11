'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useFinance } from '@/lib/FinanceContext'
import { formatCurrency } from '@/lib/constants'
import WalletCard from '@/components/WalletCard'
import TransactionRow from '@/components/TransactionRow'

function StatCard({
  label,
  amount,
  color = '#111827',
  bg = '#FFFFFF',
  topAccent = '#059669',
}: {
  label: string
  amount: number
  color?: string
  bg?: string
  topAccent?: string
}) {
  return (
    <div
      className="px-6 py-5"
      style={{
        background: bg,
        borderTop: `4px solid ${topAccent}`,
        borderLeft: '2px solid #1A1A1A',
        borderRight: '2px solid #1A1A1A',
        borderBottom: '2px solid #1A1A1A',
        borderRadius: '10px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[13px] font-[400] uppercase tracking-[0.05em]"
          style={{ color: '#6B7280' }}
        >
          {label}
        </span>
      </div>
      <p className="text-[24px] font-[500]" style={{ color }}>
        {formatCurrency(amount)}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { wallets, totalBalance, transactions, deleteTransaction, displayName, userId, loading } = useFinance()

  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!userId || loading) return
    const key = `mwc_welcomed_${userId}`
    if (!localStorage.getItem(key)) {
      setShowWelcome(true)
      localStorage.setItem(key, '1')
    }
  }, [userId, loading])

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-6 w-40 bg-[#F3F4F6] rounded animate-pulse" />
          <div className="h-4 w-56 bg-[#F3F4F6] rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 rounded-[10px] bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-28 rounded-[10px] bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const today        = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const todayTxs = transactions.filter(t => t.date === today)
  const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth))
  const monthIn  = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthOut = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const todayLabel = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="p-8 space-y-8">

      {/* Welcome banner — shown once per user */}
      {showWelcome && (
        <div
          className="flex items-center justify-between rounded-[10px] px-5 py-4"
          style={{ background: '#E8FBF4', border: '2px solid #1A1A1A' }}
        >
          <p className="text-[14px] font-[500]" style={{ color: '#065F46' }}>
            🎉 ยินดีต้อนรับ <strong>{displayName}</strong>! เริ่มบันทึกรายรับรายจ่ายได้เลย
          </p>
          <button
            onClick={() => setShowWelcome(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#059669' }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[20px] font-[500] text-[#111827]">สรุปการเงิน</h1>
        <p className="text-[14px] text-[#6B7280] mt-1">{todayLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="ยอดรวมทั้งหมด"
          amount={totalBalance}
          color="#111827"
          topAccent="#059669"
        />
        <StatCard
          label="รายรับเดือนนี้"
          amount={monthIn}
          color="#059669"
          bg="#E8FBF4"
          topAccent="#059669"
        />
        <StatCard
          label="รายจ่ายเดือนนี้"
          amount={monthOut}
          color="#EF4444"
          bg="#FEF2F2"
          topAccent="#EF4444"
        />
      </div>

      {/* Wallets */}
      <div>
        <p
          className="text-[13px] font-[400] uppercase tracking-[0.05em] mb-4"
          style={{ color: '#6B7280' }}
        >
          กระเป๋าเงิน
        </p>
        <div className="grid grid-cols-3 gap-4">
          {wallets.map(w => <WalletCard key={w.id} wallet={w} />)}
        </div>
      </div>

      {/* Today's transactions */}
      <div>
        <p
          className="text-[13px] font-[400] uppercase tracking-[0.05em] mb-4"
          style={{ color: '#6B7280' }}
        >
          รายการวันนี้
        </p>

        {todayTxs.length === 0 ? (
          <div
            className="py-16 flex flex-col items-center justify-center gap-3"
            style={{ border: '2px solid #1A1A1A', borderRadius: '10px', background: '#FFFFFF' }}
          >
            <span className="text-[48px]">📭</span>
            <p className="text-[16px] font-[500] text-[#6B7280]">ยังไม่มีรายการ</p>
            <p className="text-[14px] text-[#9CA3AF]">เริ่มบันทึกรายการแรกได้เลย</p>
          </div>
        ) : (
          <div
            className="overflow-hidden"
            style={{ border: '2px solid #1A1A1A', borderRadius: '10px', background: '#FFFFFF' }}
          >
            {todayTxs.map((tx, i) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onDelete={deleteTransaction}
                isLast={i === todayTxs.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
