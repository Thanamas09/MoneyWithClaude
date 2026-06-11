'use client'
import { useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { useFinance } from '@/lib/FinanceContext'
import { MockWallet, Category, NewWallet, NewCategory } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/constants'

// ── constants ─────────────────────────────────────────────────────────────────

const WALLET_EMOJIS = ['💵', '💳', '🏦', '🏛', '📱', '💰', '🎒', '👛', '🏧', '💎']
const CAT_EMOJIS    = ['🍔', '🚌', '🛍', '💡', '🏥', '🎬', '📦', '☕', '🎮', '🐾', '✈️', '🏠',
                       '💼', '💻', '🏦', '➕', '💰', '🎁', '📈', '💹', '🎓', '🍕', '🛺', '⚽']
const COLORS        = ['#16A34A', '#D97706', '#2563EB', '#7C3AED', '#DC2626', '#E8593C', '#0891B2', '#059669']
const CAT_COLORS    = ['#EF9F27', '#378ADD', '#D4537E', '#639922', '#7F77DD', '#E8593C', '#1D9E75', '#059669']

// ── tiny UI helpers ───────────────────────────────────────────────────────────

function SectionCard({ title, action, children }: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden" style={{ border: '2px solid #1A1A1A', borderRadius: '10px', background: '#FFFFFF' }}>
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}
      >
        <h2 className="text-[14px] font-[500] text-[#111827]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-[400] text-[#6B7280] mb-[6px]">{children}</p>
}

function FieldInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#059669] transition-colors"
      style={{ borderColor: '#E5E7EB', ...props.style }}
    />
  )
}

function EmojiGrid({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className="w-10 h-10 rounded-lg text-[20px] flex items-center justify-center border transition-all"
          style={
            value === e
              ? { borderColor: '#059669', background: '#E8FBF4', borderWidth: 2 }
              : { borderColor: '#E5E7EB', background: '#F9FAFB' }
          }
        >
          {e}
        </button>
      ))}
    </div>
  )
}

function ColorGrid({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-8 h-8 rounded-full border-2 transition-transform"
          style={{
            background:   c,
            borderColor:  value === c ? '#111827' : 'transparent',
            transform:    value === c ? 'scale(1.2)' : undefined,
          }}
        />
      ))}
    </div>
  )
}

function Modal({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl p-7 space-y-5"
        style={{ background: '#FFFFFF' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-[500] text-[#111827]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalFooter({ onCancel, onConfirm, confirmLabel = 'บันทึก', disabled }: {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  disabled?: boolean
}) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        onClick={onCancel}
        className="flex-1 h-11 rounded-lg text-[14px] font-[500] border transition-colors"
        style={{ color: '#6B7280', borderColor: '#E5E7EB', background: '#FFFFFF' }}
      >
        ยกเลิก
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="flex-1 h-11 rounded-lg text-[14px] font-[500] text-white transition-opacity disabled:opacity-40"
        style={{ background: '#059669' }}
      >
        {confirmLabel}
      </button>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const {
    wallets, categories,
    addWallet, updateWallet, deleteWallet,
    addCategory, deleteCategory,
  } = useFinance()

  // ── wallet state ────────────────────────────────────────────────────────────
  const [addWalletOpen,    setAddWalletOpen]    = useState(false)
  const [editWallet,       setEditWallet]       = useState<MockWallet | null>(null)
  const [confirmDelWallet, setConfirmDelWallet] = useState<MockWallet | null>(null)

  const blankWallet = () => ({ name: '', icon: '💵', color: '#16A34A', balance: '' })
  const [wf, setWf] = useState(blankWallet)

  const openAddWallet = () => { setWf(blankWallet()); setAddWalletOpen(true) }
  const openEditWallet = (w: MockWallet) => {
    setWf({ name: w.name, icon: w.icon, color: w.color, balance: String(w.balance) })
    setEditWallet(w)
  }

  const handleAddWallet = async () => {
    if (!wf.name.trim()) return
    const data: NewWallet = {
      name:    wf.name.trim(),
      icon:    wf.icon,
      color:   wf.color,
      bg:      wf.color + '15',
      balance: parseFloat(wf.balance) || 0,
    }
    await addWallet(data)
    setAddWalletOpen(false)
  }

  const handleEditWallet = async () => {
    if (!editWallet || !wf.name.trim()) return
    await updateWallet(editWallet.id, {
      name:    wf.name.trim(),
      icon:    wf.icon,
      color:   wf.color,
      bg:      wf.color + '15',
      balance: parseFloat(wf.balance) || 0,
    })
    setEditWallet(null)
  }

  const handleDeleteWallet = async () => {
    if (!confirmDelWallet) return
    await deleteWallet(confirmDelWallet.id)
    setConfirmDelWallet(null)
  }

  // ── category state ──────────────────────────────────────────────────────────
  const [addCatType,    setAddCatType]    = useState<'expense' | 'income' | null>(null)
  const [confirmDelCat, setConfirmDelCat] = useState<Category | null>(null)
  const [delCatError,   setDelCatError]   = useState('')

  const blankCat = (type: 'expense' | 'income') => ({
    name: '', icon: type === 'expense' ? '📦' : '➕', color: type === 'expense' ? '#888780' : '#1D9E75', type,
  })
  const [cf, setCf] = useState<{ name: string; icon: string; color: string; type: 'expense' | 'income' }>({
    name: '', icon: '📦', color: '#888780', type: 'expense',
  })

  const openAddCat = (type: 'expense' | 'income') => {
    setCf(blankCat(type))
    setAddCatType(type)
  }

  const handleAddCat = async () => {
    if (!cf.name.trim() || !addCatType) return
    await addCategory({ name: cf.name.trim(), type: cf.type, icon: cf.icon, color: cf.color })
    setAddCatType(null)
  }

  const handleDeleteCat = async () => {
    if (!confirmDelCat) return
    setDelCatError('')
    const result = await deleteCategory(confirmDelCat.id)
    if (result.error) { setDelCatError(result.error); return }
    setConfirmDelCat(null)
  }

  const openConfirmDelCat = (c: Category) => {
    setDelCatError('')
    setConfirmDelCat(c)
  }

  const expenseCats = categories.filter(c => c.type === 'expense')
  const incomeCats  = categories.filter(c => c.type === 'income')

  // ── section helpers ─────────────────────────────────────────────────────────

  function WalletRow({ w }: { w: MockWallet }) {
    const canDelete = wallets.length > 1
    return (
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #F3F4F6' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px]"
            style={{ background: w.bg ?? w.color + '15' }}
          >
            {w.icon}
          </div>
          <div>
            <p className="text-[14px] font-[500] text-[#111827]">{w.name}</p>
            <p className="text-[12px] font-[500]" style={{ color: w.color }}>
              {formatCurrency(w.balance)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditWallet(w)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#059669] hover:bg-[#E8FBF4] transition-colors"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => canDelete && setConfirmDelWallet(w)}
            disabled={!canDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => { if (canDelete) { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = '#FEF2F2' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLElement).style.background = '' }}
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    )
  }

  function CatRow({ c }: { c: Category }) {
    return (
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #F3F4F6' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px]"
            style={{ background: c.color + '20' }}
          >
            {c.icon}
          </div>
          <p className="text-[14px] font-[500] text-[#111827]">{c.name}</p>
        </div>
        <button
          onClick={() => openConfirmDelCat(c)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </div>
    )
  }

  function AddBtn({ onClick }: { onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-[500] transition-colors"
        style={{ color: '#059669', background: '#E8FBF4' }}
      >
        <Plus size={14} strokeWidth={2} />
        เพิ่ม
      </button>
    )
  }

  function WalletFields() {
    return (
      <>
        {/* Preview */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: wf.color + '12', border: `1px solid ${wf.color}40` }}
        >
          <span className="text-[28px]">{wf.icon}</span>
          <div>
            <p className="text-[15px] font-[500]" style={{ color: wf.color }}>
              {wf.name || 'ชื่อกระเป๋า'}
            </p>
            <p className="text-[13px] text-[#6B7280]">
              {formatCurrency(parseFloat(wf.balance || '0'))}
            </p>
          </div>
        </div>

        <div>
          <FieldLabel>ชื่อกระเป๋า</FieldLabel>
          <FieldInput
            value={wf.name}
            onChange={e => setWf(f => ({ ...f, name: e.target.value }))}
            placeholder="ชื่อกระเป๋า"
          />
        </div>

        <div>
          <FieldLabel>ยอดเงิน (฿)</FieldLabel>
          <FieldInput
            type="number"
            value={wf.balance}
            onChange={e => setWf(f => ({ ...f, balance: e.target.value }))}
            placeholder="0"
          />
        </div>

        <div>
          <FieldLabel>ไอคอน</FieldLabel>
          <EmojiGrid options={WALLET_EMOJIS} value={wf.icon} onChange={v => setWf(f => ({ ...f, icon: v }))} />
        </div>

        <div>
          <FieldLabel>สี</FieldLabel>
          <ColorGrid options={COLORS} value={wf.color} onChange={v => setWf(f => ({ ...f, color: v }))} />
        </div>
      </>
    )
  }

  function CatFields() {
    return (
      <>
        {/* Preview */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: cf.color + '12', border: `1px solid ${cf.color}40` }}
        >
          <span className="text-[28px]">{cf.icon}</span>
          <p className="text-[15px] font-[500]" style={{ color: cf.color }}>
            {cf.name || 'ชื่อหมวดหมู่'}
          </p>
        </div>

        <div>
          <FieldLabel>ชื่อหมวดหมู่</FieldLabel>
          <FieldInput
            value={cf.name}
            onChange={e => setCf(f => ({ ...f, name: e.target.value }))}
            placeholder="ชื่อหมวดหมู่"
          />
        </div>

        <div>
          <FieldLabel>ไอคอน</FieldLabel>
          <EmojiGrid options={CAT_EMOJIS} value={cf.icon} onChange={v => setCf(f => ({ ...f, icon: v }))} />
        </div>

        <div>
          <FieldLabel>สี</FieldLabel>
          <ColorGrid options={CAT_COLORS} value={cf.color} onChange={v => setCf(f => ({ ...f, color: v }))} />
        </div>
      </>
    )
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-[20px] font-[500] text-[#111827]">ตั้งค่า</h1>

      {/* ── Section 1: Wallets ── */}
      <SectionCard
        title={`กระเป๋าเงิน (${wallets.length})`}
        action={<AddBtn onClick={openAddWallet} />}
      >
        {wallets.length === 0 ? (
          <p className="px-5 py-6 text-[14px] text-[#9CA3AF]">ยังไม่มีกระเป๋า</p>
        ) : (
          <div>
            {wallets.map(w => <WalletRow key={w.id} w={w} />)}
          </div>
        )}
      </SectionCard>

      {/* ── Section 2: Expense categories ── */}
      <SectionCard
        title={`หมวดหมู่รายจ่าย (${expenseCats.length})`}
        action={<AddBtn onClick={() => openAddCat('expense')} />}
      >
        {expenseCats.length === 0 ? (
          <p className="px-5 py-6 text-[14px] text-[#9CA3AF]">ยังไม่มีหมวดหมู่</p>
        ) : (
          <div>
            {expenseCats.map(c => <CatRow key={c.id} c={c} />)}
          </div>
        )}
      </SectionCard>

      {/* ── Section 3: Income categories ── */}
      <SectionCard
        title={`หมวดหมู่รายรับ (${incomeCats.length})`}
        action={<AddBtn onClick={() => openAddCat('income')} />}
      >
        {incomeCats.length === 0 ? (
          <p className="px-5 py-6 text-[14px] text-[#9CA3AF]">ยังไม่มีหมวดหมู่</p>
        ) : (
          <div>
            {incomeCats.map(c => <CatRow key={c.id} c={c} />)}
          </div>
        )}
      </SectionCard>

      {/* ═══ Modals ═══ */}

      <Modal open={addWalletOpen} onClose={() => setAddWalletOpen(false)} title="เพิ่มกระเป๋า">
        {WalletFields()}
        <ModalFooter
          onCancel={() => setAddWalletOpen(false)}
          onConfirm={handleAddWallet}
          disabled={!wf.name.trim()}
        />
      </Modal>

      <Modal open={!!editWallet} onClose={() => setEditWallet(null)} title="แก้ไขกระเป๋า">
        {WalletFields()}
        <ModalFooter
          onCancel={() => setEditWallet(null)}
          onConfirm={handleEditWallet}
          disabled={!wf.name.trim()}
        />
      </Modal>

      <Modal open={!!confirmDelWallet} onClose={() => setConfirmDelWallet(null)} title="ลบกระเป๋า">
        <div
          className="rounded-xl px-4 py-3 text-[14px]"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444' }}
        >
          ลบ <strong>{confirmDelWallet?.name}</strong> จะลบรายการทั้งหมดที่เกี่ยวข้องด้วย ยืนยัน?
        </div>
        <ModalFooter
          onCancel={() => setConfirmDelWallet(null)}
          onConfirm={handleDeleteWallet}
          confirmLabel="ลบ"
        />
      </Modal>

      <Modal
        open={!!addCatType}
        onClose={() => setAddCatType(null)}
        title={addCatType === 'expense' ? 'เพิ่มหมวดหมู่รายจ่าย' : 'เพิ่มหมวดหมู่รายรับ'}
      >
        {CatFields()}
        <ModalFooter
          onCancel={() => setAddCatType(null)}
          onConfirm={handleAddCat}
          disabled={!cf.name.trim()}
        />
      </Modal>

      <Modal open={!!confirmDelCat} onClose={() => setConfirmDelCat(null)} title="ลบหมวดหมู่">
        <div
          className="rounded-xl px-4 py-3 text-[14px]"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444' }}
        >
          ลบหมวดหมู่ <strong>{confirmDelCat?.name}</strong>?
        </div>
        {delCatError && (
          <div
            className="rounded-xl px-4 py-3 text-[13px]"
            style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C' }}
          >
            {delCatError}
          </div>
        )}
        <ModalFooter
          onCancel={() => setConfirmDelCat(null)}
          onConfirm={handleDeleteCat}
          confirmLabel="ลบ"
        />
      </Modal>
    </div>
  )
}
