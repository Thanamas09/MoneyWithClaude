import { Pencil, Trash2 } from 'lucide-react'
import { Transaction } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/constants'

interface TransactionRowProps {
  transaction: Transaction
  onDelete?: (id: string) => void
  onEdit?: (tx: Transaction) => void
  isLast?: boolean
}

export default function TransactionRow({
  transaction: tx,
  onDelete,
  onEdit,
  isLast = false,
}: TransactionRowProps) {
  const isExpense  = tx.type === 'expense'
  const isTransfer = tx.type === 'transfer'
  const isIncome   = tx.type === 'income'

  const amountColor  = isExpense ? '#EF4444' : isIncome ? '#059669' : '#1D6FA4'
  const amountPrefix = isExpense ? '−' : isIncome ? '+' : '↔'

  const categoryBg = tx.category?.color
    ? `${tx.category.color}18`
    : isTransfer ? '#E0F2FE' : '#F3F4F6'
  const categoryIcon = isTransfer ? '🔄' : (tx.category?.icon ?? '💸')

  return (
    <div
      className="group flex items-center gap-4 px-5 py-[14px] hover:bg-[#F8FAFB] transition-colors duration-100"
      style={!isLast ? { borderBottom: '1px solid #F3F4F6' } : undefined}
    >
      {/* Category circle */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0"
        style={{ backgroundColor: categoryBg }}
      >
        {categoryIcon}
      </div>

      {/* Note + wallet badge */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-[500] text-[#111827] truncate">
          {tx.note || tx.category?.name || (isTransfer ? 'โอนเงิน' : '—')}
        </p>
        <div className="flex items-center gap-2 mt-[3px]">
          {tx.wallet && (
            <span
              className="text-[11px] font-[500] px-2 py-[2px] rounded-full"
              style={{
                backgroundColor: `${tx.wallet.color ?? '#059669'}18`,
                color: tx.wallet.color ?? '#059669',
              }}
            >
              {tx.wallet.icon} {tx.wallet.name}
            </span>
          )}
          {isTransfer && tx.to_wallet && (
            <span
              className="text-[11px] font-[500] px-2 py-[2px] rounded-full"
              style={{
                backgroundColor: `${tx.to_wallet.color ?? '#1D6FA4'}18`,
                color: tx.to_wallet.color ?? '#1D6FA4',
              }}
            >
              → {tx.to_wallet.icon} {tx.to_wallet.name}
            </span>
          )}
        </div>
      </div>

      {/* Time */}
      {tx.time && (
        <span className="text-[12px] text-[#9CA3AF] shrink-0">{tx.time}</span>
      )}

      {/* Amount */}
      <span
        className="text-[14px] font-[500] shrink-0 min-w-[90px] text-right"
        style={{ color: amountColor }}
      >
        {amountPrefix}{formatCurrency(tx.amount)}
      </span>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {onEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(tx) }}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#059669] hover:bg-[#E8FBF4] transition-colors"
            title="แก้ไข"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(tx.id) }}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
            title="ลบ"
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}
