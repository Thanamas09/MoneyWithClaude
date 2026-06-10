export interface Wallet {
  id: string
  user_id: string
  name: string
  balance: number
  color: string
  icon: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  to_wallet_id: string | null
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category_id: string | null
  note: string | null
  date: string
  time?: string
  created_at: string
  // joined display fields (snapshot at record time)
  wallet?: MockWallet
  to_wallet?: MockWallet
  category?: Category
}

export interface MockWallet {
  id: string
  name: string
  balance: number
  color: string
  icon: string
  bg?: string
  user_id?: string
  created_at?: string
}
