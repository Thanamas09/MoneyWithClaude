'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function translateError(error: { message?: string }): string {
  const msg = error.message?.toLowerCase() ?? ''
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'อีเมลนี้ถูกใช้งานแล้ว'
  }
  if (msg.includes('password') || msg.includes('weak')) {
    return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
  }
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

export default function RegisterPage() {
  const router = useRouter()

  const [displayName,      setDisplayName]      = useState('')
  const [email,            setEmail]            = useState('')
  const [password,         setPassword]         = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [error,            setError]            = useState('')
  const [success,          setSuccess]          = useState('')
  const [loading,          setLoading]          = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
      return
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() || email.split('@')[0] },
      },
    })
    setLoading(false)

    if (error) {
      setError(translateError(error))
      return
    }

    // Email already in use (Supabase returns user with no identities)
    if (data.user && data.user.identities?.length === 0) {
      setError('อีเมลนี้ถูกใช้งานแล้ว')
      return
    }

    // Email confirmation required (session is null)
    setSuccess('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี')
    setTimeout(() => router.push('/login'), 2000)
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
            background: '#FFFFFF',
            border:     '1px solid #E5E7EB',
            boxShadow:  '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <h2 className="text-[18px] font-[600] text-[#111827]">สมัครสมาชิก</h2>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Display name */}
            <div>
              <label className="text-[12px] font-[500] text-[#6B7280] mb-[6px] block">
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

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
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                className="w-full h-10 border rounded-lg px-3 text-[14px] text-[#111827] outline-none focus:border-[#6366F1] transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-[12px] font-[500] text-[#6B7280] mb-[6px] block">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
                style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                {error}
              </p>
            )}

            {/* Success */}
            {success && (
              <p
                className="text-[13px] rounded-lg px-3 py-2"
                style={{ color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                {success}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full h-11 rounded-lg text-[14px] font-[600] text-white transition-opacity disabled:opacity-50"
              style={{ background: '#6366F1' }}
            >
              {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
            </button>

          </form>

          {/* Link to login */}
          <p className="text-center text-[13px] text-[#6B7280]">
            มีบัญชีอยู่แล้ว?{' '}
            <Link
              href="/login"
              className="font-[600] transition-colors"
              style={{ color: '#6366F1' }}
            >
              เข้าสู่ระบบ
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
