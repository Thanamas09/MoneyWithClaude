'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, List, BarChart2, Wallet, Calculator } from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'หน้าหลัก',   icon: Home },
  { href: '/add',        label: 'บันทึก',      icon: PlusCircle },
  { href: '/history',    label: 'ประวัติ',      icon: List },
  { href: '/monthly',    label: 'รายเดือน',    icon: BarChart2 },
  { href: '/wallets',    label: 'กระเป๋าเงิน', icon: Wallet },
  { href: '/calculator', label: 'คำนวณ',       icon: Calculator },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] bg-white flex flex-col z-40"
      style={{ borderRight: '1px solid #E5E7EB' }}
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
              className={`flex items-center gap-3 h-11 pr-3 text-[14px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border-l-[3px] border-[#4F46E5] pl-[9px]'
                  : 'text-[#6B7280] border-l-[3px] border-transparent pl-[9px] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={active ? 'text-[#4F46E5]' : 'text-[#9CA3AF]'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <p className="text-[12px] text-[#9CA3AF]">FinTrack v1.0</p>
      </div>
    </aside>
  )
}
