'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, PlusCircle, List, BarChart2, Wallet, Calculator, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',  label: 'หน้าหลัก',   icon: Home },
  { href: '/add',        label: 'บันทึก',      icon: PlusCircle },
  { href: '/history',    label: 'ประวัติ',      icon: List },
  { href: '/monthly',    label: 'รายเดือน',    icon: BarChart2 },
  { href: '/wallets',    label: 'กระเป๋าเงิน', icon: Wallet },
  { href: '/calculator', label: 'คำนวณ',       icon: Calculator },
  { href: '/settings',   label: 'ตั้งค่า',     icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('mwc_'))
      .forEach(k => localStorage.removeItem(k))
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] bg-white flex flex-col z-40"
      style={{ borderRight: '2px solid #1A1A1A' }}
    >
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <span className="text-[17px] font-bold text-[#111827] flex items-center gap-2">
          <span>💰</span>
          <span>FinTrack</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (pathname === '/' && href === '/dashboard')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-11 pr-3 text-[14px] transition-all duration-150 ${
                active
                  ? 'bg-[#E8FBF4] text-[#059669] font-[500] border-l-[3px] border-[#059669] pl-[9px]'
                  : 'text-[#6B7280] font-[400] border-l-[3px] border-transparent pl-[9px] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={active ? 'text-[#059669]' : 'text-[#9CA3AF]'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 h-10 px-3 rounded-lg text-[13px] font-[500] transition-colors text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
        >
          <LogOut size={16} strokeWidth={1.8} />
          ออกจากระบบ
        </button>
        <p className="text-[11px] text-[#D1D5DB] px-3">FinTrack v1.0</p>
      </div>
    </aside>
  )
}
