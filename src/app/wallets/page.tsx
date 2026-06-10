'use client'
import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useFinance } from '@/lib/FinanceContext'
import { MockWallet } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/constants'

const EMOJI_OPTIONS = ['💵','📱','🏦','🏛','💳','💰','🪙','🏧','💎','🎯','💸','🌟']
const COLOR_OPTIONS = ['#16A34A','#D97706','#2563EB','#7C3AED','#DC2626','#E8593C','#0891B2','#6366F1','#EC4899','#059669','#D97706','#374151']

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-[500] text-[#6B7280] mb-[6px]">{children}</p>
}

export default function WalletsPage() {
  const { wallets, totalBalance, updateWallet } = useFinance()

  const [editing,     setEditing]     = useState<MockWallet | null>(null)
  const [editName,    setEditName]    = useState('')
  const [editBalance, setEditBalance] = useState('')
  const [editColor,   setEditColor]   = useState('')
  const [editIcon,    setEditIcon]    = useState('')

  const openEdit = (w: MockWallet) => {
    setEditing(w)
    setEditName(w.name)
    setEditBalance(String(w.balance))
    setEditColor(w.color)
    setEditIcon(w.icon)
  }

  const saveEdit = () => {
    if (!editing) return
    updateWallet(editing.id, {
      name:    editName.trim() || editing.name,
      balance: parseFloat(editBalance) || 0,
      color:   editColor,
      icon:    editIcon,
      bg:      editColor + '15',
    })
    setEditing(null)
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-[20px] font-[600] text-[#111827]">กระเป๋าเงิน</h1>

      {/* Total */}
      <div
        className="rounded-xl px-6 py-5"
        style={{ background: '#6366F1', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
      >
        <p className="text-[13px] font-[500] uppercase tracking-[0.05em] text-indigo-200">ยอดรวมทุกกระเป๋า</p>
        <p className="text-[28px] font-[700] text-white mt-1">{formatCurrency(totalBalance)}</p>
      </div>

      {/* Wallet grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {wallets.map(w => (
          <div
            key={w.id}
            className="bg-white rounded-xl p-5 flex items-start justify-between"
            style={{
              borderTop: `4px solid ${w.color}`,
              borderLeft: '1px solid #E5E7EB',
              borderRight: '1px solid #E5E7EB',
              borderBottom: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px]"
                style={{ background: w.bg ?? `${w.color}15` }}
              >
                {w.icon}
              </div>
              <div>
                <p className="text-[14px] font-[500] text-[#111827]">{w.name}</p>
                <p className="text-[18px] font-[700] mt-0.5" style={{ color: w.color }}>
                  {formatCurrency(w.balance)}
                </p>
              </div>
            </div>
            <button
              onClick={() => openEdit(w)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-colors"
            >
              <Pencil size={15} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <div
            className="w-[400px] rounded-2xl p-7 space-y-5"
            style={{ background: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-[600] text-[#111827]">แก้ไขกระเป๋า</h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: `${editColor}12`, border: `1px solid ${editColor}40` }}
            >
              <span className="text-[28px]">{editIcon}</span>
              <div>
                <p className="text-[15px] font-[600]" style={{ color: editColor }}>
                  {editName || editing.name}
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  {formatCurrency(parseFloat(editBalance || '0'))}
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <FieldLabel>ชื่อกระเป๋า</FieldLabel>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            {/* Balance */}
            <div>
              <FieldLabel>ยอดเงิน (฿)</FieldLabel>
              <input
                type="number"
                value={editBalance}
                onChange={e => setEditBalance(e.target.value)}
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            {/* Icon picker */}
            <div>
              <FieldLabel>ไอคอน</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEditIcon(e)}
                    className="w-10 h-10 rounded-lg text-[20px] flex items-center justify-center border transition-all"
                    style={
                      editIcon === e
                        ? { borderColor: '#6366F1', background: '#EEF2FF', borderWidth: 2 }
                        : { borderColor: '#E5E7EB', background: '#F9FAFB' }
                    }
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <FieldLabel>สี</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setEditColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: editColor === c ? '#111827' : 'transparent',
                      transform: editColor === c ? 'scale(1.2)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 h-11 rounded-lg text-[14px] font-[600] border transition-colors"
                style={{ color: '#6B7280', borderColor: '#E5E7EB', background: '#FFFFFF' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 h-11 rounded-lg text-[14px] font-[600] text-white"
                style={{ background: '#6366F1' }}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
