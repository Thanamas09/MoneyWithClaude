import { MockWallet } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/constants'

interface WalletCardProps {
  wallet: MockWallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div
      className="bg-white p-5 flex flex-col gap-3"
      style={{
        borderTop: `4px solid ${wallet.color}`,
        borderLeft: '2px solid #1A1A1A',
        borderRight: '2px solid #1A1A1A',
        borderBottom: '2px solid #1A1A1A',
        borderRadius: '10px',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{wallet.icon}</span>
        <span className="text-[14px] font-[500] text-[#111827] truncate">{wallet.name}</span>
      </div>
      <div className="flex justify-end">
        <span
          className="text-[20px] font-[500]"
          style={{ color: wallet.color }}
        >
          {formatCurrency(wallet.balance)}
        </span>
      </div>
    </div>
  )
}
