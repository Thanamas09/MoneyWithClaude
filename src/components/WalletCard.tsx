import { MockWallet } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/constants'

interface WalletCardProps {
  wallet: MockWallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-3"
      style={{
        borderTop: `4px solid ${wallet.color}`,
        borderLeft: '1px solid #E5E7EB',
        borderRight: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{wallet.icon}</span>
        <span className="text-[14px] font-[500] text-[#111827] truncate">{wallet.name}</span>
      </div>
      <div className="flex justify-end">
        <span
          className="text-[20px] font-[700]"
          style={{ color: wallet.color }}
        >
          {formatCurrency(wallet.balance)}
        </span>
      </div>
    </div>
  )
}
