'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useFinance } from '@/lib/FinanceContext'
import { formatCurrency } from '@/lib/constants'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-[500] text-[#6B7280] mb-[6px]">{children}</p>
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <p className="text-[13px] font-[600] text-[#111827]">{title}</p>
      {children}
    </div>
  )
}

export default function CalculatorPage() {
  const { wallets } = useFinance()

  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && wallets.length > 0) {
      setSelected(new Set(wallets.map(w => w.id)))
      initialized.current = true
    }
  }, [wallets])
  const [adjustMode,   setAdjustMode]   = useState<'add' | 'subtract'>('subtract')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [days,         setDays]         = useState('')

  const toggleWallet = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const selectedTotal = useMemo(
    () => wallets.filter(w => selected.has(w.id)).reduce((s, w) => s + w.balance, 0),
    [wallets, selected],
  )

  const adj       = parseFloat(adjustAmount) || 0
  const available = adjustMode === 'add' ? selectedTotal + adj : selectedTotal - adj
  const numDays   = parseInt(days) || 0
  const perDay    = numDays > 0 && available > 0 ? available / numDays : null

  return (
    <div className="p-8">
      <h1 className="text-[20px] font-[600] text-[#111827] mb-6">คำนวณเงินคงเหลือ</h1>

      <div className="flex gap-6 items-start">
        {/* Left: input sections (2/3) */}
        <div className="flex-[2] space-y-4">

          {/* Section 1 — wallet selection */}
          <SectionCard title="เลือกกระเป๋าเงิน">
            <div className="space-y-3">
              {wallets.map(w => (
                <label key={w.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selected.has(w.id)}
                    onChange={() => toggleWallet(w.id)}
                    className="w-4 h-4 rounded accent-[#6366F1]"
                  />
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] shrink-0"
                    style={{ background: w.bg ?? `${w.color}15` }}
                  >
                    {w.icon}
                  </div>
                  <span className="flex-1 text-[14px] font-[500] text-[#374151] group-hover:text-[#111827] transition-colors">
                    {w.name}
                  </span>
                  <span className="text-[14px] font-[600]" style={{ color: w.color }}>
                    {formatCurrency(w.balance)}
                  </span>
                </label>
              ))}
            </div>
            {/* Subtotal */}
            <div
              className="flex items-center justify-between pt-3 mt-1"
              style={{ borderTop: '1px solid #F3F4F6' }}
            >
              <span className="text-[13px] text-[#6B7280]">ยอดรวมที่เลือก</span>
              <span className="text-[16px] font-[700] text-[#6366F1]">{formatCurrency(selectedTotal)}</span>
            </div>
          </SectionCard>

          {/* Section 2 — adjustment */}
          <SectionCard title="ปรับยอด (ไม่บังคับ)">
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setAdjustMode('add')}
                className="flex-1 h-9 text-[13px] font-[600] transition-colors"
                style={
                  adjustMode === 'add'
                    ? { background: '#DCFCE7', color: '#16A34A' }
                    : { background: '#F9FAFB', color: '#6B7280' }
                }
              >
                + เพิ่ม
              </button>
              <button
                onClick={() => setAdjustMode('subtract')}
                className="flex-1 h-9 text-[13px] font-[600] transition-colors"
                style={
                  adjustMode === 'subtract'
                    ? { background: '#FEE2E2', color: '#DC2626' }
                    : { background: '#F9FAFB', color: '#6B7280' }
                }
              >
                − ลด
              </button>
            </div>
            <div>
              <FieldLabel>จำนวนเงิน</FieldLabel>
              <input
                type="number"
                placeholder="0.00"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>
            <p className="text-[12px] text-[#9CA3AF]">
              เช่น หักค่าใช้จ่ายที่รู้ล่วงหน้า หรือบวกเงินที่รอรับ
            </p>
          </SectionCard>

          {/* Section 3 — days */}
          <SectionCard title="จำนวนวัน">
            <div>
              <FieldLabel>ต้องการใช้เงินกี่วัน?</FieldLabel>
              <input
                type="number"
                placeholder="เช่น 30"
                value={days}
                onChange={e => setDays(e.target.value)}
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>
          </SectionCard>
        </div>

        {/* Right: result card (1/3), sticky */}
        <div className="flex-1 sticky top-8">
          <div
            className="rounded-xl p-6 space-y-5"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <p className="text-[13px] font-[600] text-[#111827]">ผลลัพธ์</p>

            {/* Available amount */}
            <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
              <p className="text-[12px] font-[500] text-[#6B7280] mb-1">ยอดเงินที่ใช้ได้</p>
              <p
                className="text-[22px] font-[700]"
                style={{ color: available > 0 ? '#111827' : '#DC2626' }}
              >
                {formatCurrency(Math.max(available, 0))}
              </p>
              {adj > 0 && (
                <p className="text-[12px] text-[#9CA3AF] mt-1">
                  {formatCurrency(selectedTotal)} {adjustMode === 'add' ? '+' : '−'} {formatCurrency(adj)}
                </p>
              )}
            </div>

            {/* Per-day */}
            <div className="text-center py-4">
              {perDay !== null ? (
                <>
                  <p className="text-[12px] font-[500] text-[#6B7280] mb-2">เฉลี่ยวันละ</p>
                  <p className="font-[700] text-[#6366F1]" style={{ fontSize: '28px' }}>
                    {formatCurrency(perDay)}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">ใช้ {numDays} วัน</p>
                </>
              ) : numDays > 0 && available <= 0 ? (
                <>
                  <span className="text-[32px]">😔</span>
                  <p className="text-[14px] font-[500] text-[#DC2626] mt-2">ยอดไม่พอสำหรับ {numDays} วัน</p>
                </>
              ) : (
                <>
                  <span className="text-[36px]">📅</span>
                  <p className="text-[14px] text-[#9CA3AF] mt-2">ใส่จำนวนวันเพื่อดูค่าเฉลี่ยต่อวัน</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
