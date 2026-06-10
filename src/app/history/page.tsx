'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useFinance, NewTransaction } from '@/lib/FinanceContext'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from '@/lib/constants'
import { Transaction } from '@/lib/supabase/types'
import TransactionRow from '@/components/TransactionRow'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

type TxType = 'income' | 'expense' | 'transfer'
type FilterType = 'all' | TxType

const TYPE_CONFIG: Record<TxType, { label: string; activeBg: string; activeColor: string; activeBorder: string }> = {
  expense:  { label: 'รายจ่าย', activeBg: '#FEE2E2', activeColor: '#DC2626', activeBorder: '#FCA5A5' },
  income:   { label: 'รายรับ',  activeBg: '#DCFCE7', activeColor: '#16A34A', activeBorder: '#86EFAC' },
  transfer: { label: 'โอน',     activeBg: '#EEF2FF', activeColor: '#4F46E5', activeBorder: '#A5B4FC' },
}

interface EditForm {
  type: TxType
  amount: string
  walletId: string
  toWalletId: string
  categoryId: string
  date: string
  time: string
  note: string
}

function FieldInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#6366F1]"
      style={{ borderColor: '#E5E7EB', ...props.style }}
    />
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-[500] text-[#6B7280] mb-[6px]">{children}</p>
}

export default function HistoryPage() {
  const { wallets, transactions, deleteTransaction, updateTransaction } = useFinance()

  const [search,       setSearch]       = useState('')
  const [walletFilter, setWalletFilter] = useState('all')
  const [typeFilter,   setTypeFilter]   = useState<FilterType>('all')
  const [editOpen,     setEditOpen]     = useState(false)
  const [editTx,       setEditTx]       = useState<Transaction | null>(null)
  const [form,         setForm]         = useState<EditForm>({
    type: 'expense', amount: '', walletId: '', toWalletId: '',
    categoryId: '', date: '', time: '', note: '',
  })

  const filtered = transactions.filter(tx => {
    const q = search.toLowerCase()
    if (q && !tx.note?.toLowerCase().includes(q) && !tx.category?.name.toLowerCase().includes(q)) return false
    if (walletFilter !== 'all' && tx.wallet_id !== walletFilter) return false
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    return true
  })

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const formatDateHeader = (d: string) => {
    try { return format(new Date(d + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: th }) }
    catch { return d }
  }

  const openEdit = (tx: Transaction) => {
    setEditTx(tx)
    setForm({
      type:       tx.type,
      amount:     String(tx.amount),
      walletId:   tx.wallet_id,
      toWalletId: tx.to_wallet_id ?? (wallets.find(w => w.id !== tx.wallet_id)?.id ?? ''),
      categoryId: tx.category_id ?? '',
      date:       tx.date,
      time:       tx.time ?? '',
      note:       tx.note ?? '',
    })
    setEditOpen(true)
  }

  const setF = <K extends keyof EditForm>(k: K, v: EditForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleTypeChange = (t: TxType) => setForm(f => ({ ...f, type: t, categoryId: '' }))

  const saveEdit = () => {
    if (!editTx) return
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return
    const update: NewTransaction = {
      type:         form.type,
      amount:       amt,
      wallet_id:    form.walletId,
      to_wallet_id: form.type === 'transfer' ? (form.toWalletId || null) : null,
      category_id:  form.type !== 'transfer' ? (form.categoryId || null) : null,
      note:         form.note.trim() || null,
      date:         form.date,
      time:         form.time || undefined,
    }
    updateTransaction(editTx.id, update)
    setEditOpen(false)
    setEditTx(null)
  }

  const editCategories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-[20px] font-[600] text-[#111827]">ประวัติรายการ</h1>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="ค้นหา..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 w-56 border rounded-lg px-3 text-[14px] outline-none transition-colors focus:border-[#6366F1] bg-white"
          style={{ borderColor: '#E5E7EB' }}
        />
        <select
          value={walletFilter}
          onChange={e => setWalletFilter(e.target.value)}
          className="h-9 border rounded-lg px-3 text-[14px] text-[#111827] outline-none bg-white"
          style={{ borderColor: '#E5E7EB' }}
        >
          <option value="all">ทุกกระเป๋า</option>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
        </select>
        <div className="flex gap-1">
          {(['all', 'expense', 'income', 'transfer'] as FilterType[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="h-9 px-3 rounded-lg text-[13px] font-[500] border transition-all duration-150"
              style={
                typeFilter === t
                  ? { background: '#6366F1', color: '#fff', borderColor: '#6366F1' }
                  : { background: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
              }
            >
              {t === 'all' ? 'ทั้งหมด' : t === 'expense' ? 'รายจ่าย' : t === 'income' ? 'รายรับ' : 'โอน'}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <span className="ml-auto text-[13px] text-[#9CA3AF]">{filtered.length} รายการ</span>
        )}
      </div>

      {/* Transaction list */}
      {sortedDates.length === 0 ? (
        <div
          className="rounded-xl py-20 flex flex-col items-center justify-center gap-3"
          style={{ border: '1px solid #E5E7EB', background: '#FFFFFF' }}
        >
          <span className="text-[48px]">💸</span>
          <p className="text-[16px] font-[500] text-[#6B7280]">ยังไม่มีรายการ</p>
          <p className="text-[14px] text-[#9CA3AF]">เริ่มบันทึกรายการแรกได้เลย</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const dayTxs    = grouped[date]
            const dayIn     = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const dayOut    = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
            return (
              <div key={date}>
                {/* Date header */}
                <div
                  className="flex items-center justify-between px-5 py-2"
                  style={{
                    background: '#F9FAFB',
                    borderRadius: '8px 8px 0 0',
                    borderTop: '1px solid #E5E7EB',
                    borderLeft: '1px solid #E5E7EB',
                    borderRight: '1px solid #E5E7EB',
                  }}
                >
                  <span className="text-[13px] font-[600] text-[#6B7280]">
                    {formatDateHeader(date)}
                  </span>
                  <div className="flex gap-3 text-[12px]">
                    {dayIn  > 0 && <span style={{ color: '#16A34A' }} className="font-[500]">+{formatCurrency(dayIn)}</span>}
                    {dayOut > 0 && <span style={{ color: '#DC2626' }} className="font-[500]">−{formatCurrency(dayOut)}</span>}
                  </div>
                </div>
                {/* Rows */}
                <div
                  style={{
                    borderLeft: '1px solid #E5E7EB',
                    borderRight: '1px solid #E5E7EB',
                    borderBottom: '1px solid #E5E7EB',
                    borderRadius: '0 0 8px 8px',
                    background: '#FFFFFF',
                  }}
                >
                  {dayTxs.map((tx, i) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      onDelete={deleteTransaction}
                      onEdit={openEdit}
                      isLast={i === dayTxs.length - 1}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) { setEditOpen(false); setEditTx(null) } }}
        >
          <div
            className="w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl p-7 space-y-5"
            style={{ background: '#FFFFFF' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-[600] text-[#111827]">แก้ไขรายการ</h2>
              <button
                onClick={() => { setEditOpen(false); setEditTx(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Type toggle */}
            <div className="flex gap-2">
              {(Object.entries(TYPE_CONFIG) as [TxType, typeof TYPE_CONFIG[TxType]][]).map(([t, cfg]) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className="flex-1 h-9 rounded-lg text-[13px] font-[600] border transition-all duration-150"
                  style={
                    form.type === t
                      ? { background: cfg.activeBg, color: cfg.activeColor, borderColor: cfg.activeBorder }
                      : { background: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }
                  }
                >
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div>
              <FieldLabel>จำนวนเงิน (฿)</FieldLabel>
              <input
                type="number"
                value={form.amount}
                onChange={e => setF('amount', e.target.value)}
                className="w-full bg-transparent outline-none text-center text-[#111827] transition-colors"
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  border: 'none',
                  borderBottom: `2px solid ${form.amount ? TYPE_CONFIG[form.type].activeBorder : '#E5E7EB'}`,
                  paddingBottom: '8px',
                }}
              />
            </div>

            {/* Wallet */}
            <div>
              <FieldLabel>{form.type === 'transfer' ? 'จากกระเป๋า' : 'กระเป๋า'}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setF('walletId', w.id)}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[500] border transition-all"
                    style={
                      form.walletId === w.id
                        ? { background: `${w.color}15`, color: w.color, borderColor: w.color }
                        : { background: '#F9FAFB', color: '#6B7280', borderColor: '#E5E7EB' }
                    }
                  >
                    {w.icon} {w.name}
                  </button>
                ))}
              </div>
            </div>

            {/* To-wallet */}
            {form.type === 'transfer' && (
              <div>
                <FieldLabel>ไปกระเป๋า</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {wallets.filter(w => w.id !== form.walletId).map(w => (
                    <button
                      key={w.id}
                      onClick={() => setF('toWalletId', w.id)}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-[500] border transition-all"
                      style={
                        form.toWalletId === w.id
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

            {/* Category */}
            {form.type !== 'transfer' && (
              <div>
                <FieldLabel>หมวดหมู่</FieldLabel>
                <div className="grid grid-cols-7 gap-1.5">
                  {editCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setF('categoryId', cat.id)}
                      className="flex flex-col items-center justify-center gap-1 rounded-[8px] border transition-all"
                      style={{
                        height: 52,
                        background: form.categoryId === cat.id ? '#EEF2FF' : '#F9FAFB',
                        border: form.categoryId === cat.id ? '2px solid #6366F1' : '1px solid #E5E7EB',
                      }}
                    >
                      <span className="text-[17px] leading-none">{cat.icon}</span>
                      <span className="text-[8px] text-[#6B7280] text-center px-0.5 leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>วันที่</FieldLabel>
                <FieldInput type="date" value={form.date} onChange={e => setF('date', e.target.value)} />
              </div>
              <div>
                <FieldLabel>เวลา</FieldLabel>
                <FieldInput type="time" value={form.time} onChange={e => setF('time', e.target.value)} />
              </div>
            </div>

            {/* Note */}
            <div>
              <FieldLabel>หมายเหตุ</FieldLabel>
              <FieldInput
                type="text"
                placeholder="หมายเหตุ (ไม่บังคับ)"
                value={form.note}
                onChange={e => setF('note', e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setEditOpen(false); setEditTx(null) }}
                className="flex-1 h-11 rounded-lg text-[14px] font-[600] border transition-colors"
                style={{ color: '#6B7280', borderColor: '#E5E7EB', background: '#FFFFFF' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 h-11 rounded-lg text-[14px] font-[600] text-white transition-opacity"
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
