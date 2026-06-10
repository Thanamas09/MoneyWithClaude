'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#FAFAFA' }}
    >
      <div className="w-full max-w-[380px] px-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[44px]">💰</span>
          <h1 className="text-[24px] font-[700] text-[#111827] mt-2">FinTrack</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">จัดการการเงินส่วนตัว</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 space-y-5"
          style={{
            background:  '#FFFFFF',
            border:      '1px solid #E5E7EB',
            boxShadow:   '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <h2 className="text-[18px] font-[600] text-[#111827]">เข้าสู่ระบบ</h2>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-[12px] font-[500] text-[#6B7280] mb-[6px] block">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[12px] font-[500] text-[#6B7280] mb-[6px] block">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-[13px] rounded-lg px-3 py-2"
                style={{
                  color:      '#DC2626',
                  background: '#FEF2F2',
                  border:     '1px solid #FECACA',
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-[14px] font-[600] text-white transition-opacity disabled:opacity-50"
              style={{ background: '#6366F1' }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
