'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFinance } from '@/lib/FinanceContext'

type TxType = 'expense' | 'income' | 'transfer'

const TYPE_CONFIG: Record<TxType, { label: string; activeBg: string; activeColor: string; activeBorder: string }> = {
  expense:  { label: 'รายจ่าย', activeBg: '#FEE2E2', activeColor: '#DC2626', activeBorder: '#FCA5A5' },
  income:   { label: 'รายรับ',  activeBg: '#DCFCE7', activeColor: '#16A34A', activeBorder: '#86EFAC' },
  transfer: { label: 'โอน',     activeBg: '#EEF2FF', activeColor: '#4F46E5', activeBorder: '#A5B4FC' },
}

function now() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-[500] text-[#6B7280] mb-[6px]">{children}</p>
  )
}

function FieldInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#6366F1] ${props.className ?? ''}`}
      style={{ borderColor: '#E5E7EB', ...props.style }}
    />
  )
}

export default function AddPage() {
  const router = useRouter()
  const { wallets, categories: allCategories, addTransaction, loading } = useFinance()

  const [txType,     setTxType]     = useState<TxType>('expense')
  const [amount,     setAmount]     = useState('')
  const [walletId,   setWalletId]   = useState(wallets[0]?.id ?? '')
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [time,       setTime]       = useState(now)
  const [note,       setNote]       = useState('')

  // Sync wallet selection once wallets load from Supabase
  useEffect(() => {
    if (wallets.length > 0) {
      setWalletId(id => id || wallets[0].id)
      setToWalletId(id => id || (wallets[1]?.id ?? ''))
    }
  }, [wallets])

  const categories = allCategories.filter(c => c.type === txType)
  const canSubmit  = !!amount && parseFloat(amount) > 0 && !!walletId && (
    txType === 'transfer'
      ? !!toWalletId && toWalletId !== walletId
      : !!categoryId
  )

  const handleTypeChange = (t: TxType) => { setTxType(t); setCategoryId('') }

  const handleWalletChange = (id: string) => {
    setWalletId(id)
    if (toWalletId === id) setToWalletId('')
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    await addTransaction({
      wallet_id:    walletId,
      to_wallet_id: txType === 'transfer' ? (toWalletId || null) : null,
      type:         txType,
      amount:       parseFloat(amount),
      category_id:  txType === 'transfer' ? null : (categoryId || null),
      note:         note.trim() || null,
      date,
      time:         time || undefined,
    })
    router.push('/history')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-[#9CA3AF]">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-[20px] font-[600] text-[#111827] mb-6">บันทึกรายการ</h1>

      <div
        className="rounded-xl p-6 space-y-6"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        {/* Type toggle */}
        <div className="flex gap-2">
          {(Object.entries(TYPE_CONFIG) as [TxType, typeof TYPE_CONFIG[TxType]][]).map(([t, cfg]) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className="flex-1 h-9 rounded-lg text-[13px] font-[600] border transition-all duration-150"
              style={
                txType === t
                  ? { background: cfg.activeBg, color: cfg.activeColor, borderColor: cfg.activeBorder }
                  : { background: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }
              }
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Amount — large centered bottom-border style */}
        <div className="py-2">
          <input
            type="number"
            placeholder="฿ 0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full text-center bg-transparent outline-none text-[#111827] placeholder-[#D1D5DB] transition-colors"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              border: 'none',
              borderBottom: `2px solid ${amount ? TYPE_CONFIG[txType].activeBorder : '#E5E7EB'}`,
              paddingBottom: '10px',
            }}
          />
        </div>

        {/* Wallet selector */}
        <div>
          <Label>{txType === 'transfer' ? 'จากกระเป๋า' : 'กระเป๋า'}</Label>
          <div className="flex flex-wrap gap-2">
            {wallets.map(w => (
              <button
                key={w.id}
                onClick={() => handleWalletChange(w.id)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[500] border transition-all duration-150"
                style={
                  walletId === w.id
                    ? { background: `${w.color}15`, color: w.color, borderColor: w.color }
                    : { background: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }
                }
              >
                {w.icon} {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* To-wallet (transfer only) */}
        {txType === 'transfer' && (
          <div>
            <Label>ไปกระเป๋า</Label>
            <div className="flex flex-wrap gap-2">
              {wallets.filter(w => w.id !== walletId).map(w => (
                <button
                  key={w.id}
                  onClick={() => setToWalletId(w.id)}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[500] border transition-all duration-150"
                  style={
                    toWalletId === w.id
                      ? { background: `${w.color}15`, color: w.color, borderColor: w.color }
                      : { background: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }
                  }
                >
                  {w.icon} {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category grid */}
        {txType !== 'transfer' && (
          <div>
            <Label>หมวดหมู่</Label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className="flex flex-col items-center justify-center gap-[5px] rounded-[10px] border transition-all duration-150"
                  style={{
                    width: 56, height: 56,
                    background: categoryId === cat.id ? '#EEF2FF' : '#F9FAFB',
                    border: categoryId === cat.id ? '2px solid #6366F1' : '1px solid #E5E7EB',
                  }}
                >
                  <span className="text-[20px] leading-none">{cat.icon}</span>
                  <span className="text-[9px] text-[#6B7280] leading-tight text-center px-0.5">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>วันที่</Label>
            <FieldInput type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <Label>เวลา</Label>
            <FieldInput type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        {/* Note */}
        <div>
          <Label>หมายเหตุ</Label>
          <FieldInput
            type="text"
            placeholder="เพิ่มหมายเหตุ (ไม่บังคับ)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-11 rounded-lg text-[14px] font-[600] text-white transition-opacity duration-150 disabled:opacity-40"
          style={{ background: '#6366F1' }}
        >
          บันทึก
        </button>
      </div>
    </div>
  )
}
