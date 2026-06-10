'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { MockWallet, Transaction } from './supabase/types'
import { ALL_CATEGORIES } from './constants'

const WALLETS_KEY = 'mwc_wallets'
const TXS_KEY = 'mwc_transactions'

const INITIAL_WALLETS: MockWallet[] = [
  { id: 'cash',   name: 'เงินสด',    balance: 0, color: '#16A34A', bg: '#F0FDF4', icon: '💵' },
  { id: 'true',   name: 'TrueMoney', balance: 0, color: '#D97706', bg: '#FFFBEB', icon: '📱' },
  { id: 'kpush1', name: 'K-push 1',  balance: 0, color: '#2563EB', bg: '#EFF6FF', icon: '🏦' },
  { id: 'kpush2', name: 'K-push 2',  balance: 0, color: '#2563EB', bg: '#EFF6FF', icon: '🏦' },
  { id: 'scb1',   name: 'SCB 1',     balance: 0, color: '#7C3AED', bg: '#F5F3FF', icon: '🏛' },
  { id: 'scb2',   name: 'SCB 2',     balance: 0, color: '#7C3AED', bg: '#F5F3FF', icon: '🏛' },
]

export type NewTransaction = {
  wallet_id: string
  to_wallet_id: string | null
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category_id: string | null
  note: string | null
  date: string
  time?: string
}

interface FinanceContextType {
  wallets: MockWallet[]
  totalBalance: number
  updateWallet: (id: string, updates: Partial<MockWallet>) => void
  transactions: Transaction[]
  addTransaction: (tx: NewTransaction) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, updates: NewTransaction) => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function useFinance(): FinanceContextType {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}

type DeltaEntry = { id: string; delta: number }

function getDeltas(tx: Pick<Transaction, 'type' | 'amount' | 'wallet_id' | 'to_wallet_id'>): DeltaEntry[] {
  if (tx.type === 'expense') return [{ id: tx.wallet_id, delta: -tx.amount }]
  if (tx.type === 'income')  return [{ id: tx.wallet_id, delta: +tx.amount }]
  if (tx.type === 'transfer' && tx.to_wallet_id) {
    return [
      { id: tx.wallet_id,    delta: -tx.amount },
      { id: tx.to_wallet_id, delta: +tx.amount },
    ]
  }
  return []
}

function applyDeltas(wallets: MockWallet[], deltas: DeltaEntry[]): MockWallet[] {
  return wallets.map(w => {
    const d = deltas.find(d => d.id === w.id)
    if (!d) return w
    return { ...w, balance: Math.round((w.balance + d.delta) * 100) / 100 }
  })
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets]           = useState<MockWallet[]>(INITIAL_WALLETS)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loaded, setLoaded]             = useState(false)

  // Load from localStorage once on mount
  useEffect(() => {
    setWallets(readStorage<MockWallet[]>(WALLETS_KEY, INITIAL_WALLETS))
    setTransactions(readStorage<Transaction[]>(TXS_KEY, []))
    setLoaded(true)
  }, [])

  // Persist to localStorage whenever state changes (skip before initial load)
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
  }, [wallets, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(TXS_KEY, JSON.stringify(transactions))
  }, [transactions, loaded])

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)

  const updateWallet = (id: string, updates: Partial<MockWallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const addTransaction = (newTx: NewTransaction) => {
    setWallets(prev => applyDeltas(prev, getDeltas(newTx)))
    setTransactions(prev => {
      const enriched: Transaction = {
        ...newTx,
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: 'local',
        created_at: new Date().toISOString(),
        wallet:    wallets.find(w => w.id === newTx.wallet_id),
        to_wallet: newTx.to_wallet_id ? wallets.find(w => w.id === newTx.to_wallet_id) : undefined,
        category:  ALL_CATEGORIES.find(c => c.id === newTx.category_id),
      }
      return [enriched, ...prev]
    })
  }

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id)
    if (!tx) return
    const reverseDeltas = getDeltas(tx).map(d => ({ ...d, delta: -d.delta }))
    setWallets(prev => applyDeltas(prev, reverseDeltas))
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const updateTransaction = (id: string, updates: NewTransaction) => {
    const old = transactions.find(t => t.id === id)
    if (!old) return
    const reverseDeltas = getDeltas(old).map(d => ({ ...d, delta: -d.delta }))
    const newDeltas     = getDeltas(updates)
    setWallets(prev => applyDeltas(applyDeltas(prev, reverseDeltas), newDeltas))
    setTransactions(prev => prev.map(t => t.id !== id ? t : {
      ...t,
      ...updates,
      wallet:    wallets.find(w => w.id === updates.wallet_id),
      to_wallet: updates.to_wallet_id ? wallets.find(w => w.id === updates.to_wallet_id) : undefined,
      category:  ALL_CATEGORIES.find(c => c.id === updates.category_id),
    }))
  }

  return (
    <FinanceContext.Provider value={{
      wallets, totalBalance, updateWallet,
      transactions, addTransaction, deleteTransaction, updateTransaction,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}
