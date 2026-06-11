'use client'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import { MockWallet, Transaction, Category, NewWallet, NewCategory } from './supabase/types'
import { WALLETS_CONFIG } from './constants'
import { createClient } from './supabase/client'

// ── seed data ─────────────────────────────────────────────────────────────────

const SEED_WALLETS = WALLETS_CONFIG.map(w => ({
  name:    w.name,
  icon:    w.icon,
  color:   w.color,
  bg:      w.bg,
  balance: 0,
}))

const SEED_CATEGORIES: NewCategory[] = [
  { name: 'อาหาร',       type: 'expense', icon: '🍔', color: '#EF9F27' },
  { name: 'เดินทาง',     type: 'expense', icon: '🚌', color: '#378ADD' },
  { name: 'ช้อปปิ้ง',    type: 'expense', icon: '🛍', color: '#D4537E' },
  { name: 'สาธารณูปโภค', type: 'expense', icon: '💡', color: '#639922' },
  { name: 'สุขภาพ',      type: 'expense', icon: '🏥', color: '#7F77DD' },
  { name: 'บันเทิง',     type: 'expense', icon: '🎬', color: '#E8593C' },
  { name: 'อื่นๆ',       type: 'expense', icon: '📦', color: '#888780' },
  { name: 'เงินเดือน',   type: 'income',  icon: '💼', color: '#1D9E75' },
  { name: 'ฟรีแลนซ์',   type: 'income',  icon: '💻', color: '#0F6E56' },
  { name: 'ดอกเบี้ย',   type: 'income',  icon: '🏦', color: '#2563EB' },
  { name: 'อื่นๆ',       type: 'income',  icon: '➕', color: '#639922' },
]

// ── demo ──────────────────────────────────────────────────────────────────────

export const DEMO_EMAIL = 'demo@fintrack.app'

const DEMO_WALLETS = [
  { name: 'เงินสด', icon: '💵', color: '#16A34A', bg: '#16A34A15', balance: 500  },
  { name: 'SCB',    icon: '🏦', color: '#2563EB', bg: '#2563EB15', balance: 8000 },
  { name: 'K-push', icon: '📱', color: '#7C3AED', bg: '#7C3AED15', balance: 3200 },
]

type TxTemplate = {
  date: string; type: 'income' | 'expense' | 'transfer'
  amount: number; walletName: string; toWalletName?: string
  catName?: string; note?: string; time?: string
}

const DEMO_TRANSACTIONS: TxTemplate[] = [
  { date: '2026-04-01', type: 'income',   amount: 25000, walletName: 'SCB',    catName: 'เงินเดือน',   note: 'เงินเดือนเมษายน',    time: '09:00' },
  { date: '2026-04-03', type: 'expense',  amount: 120,   walletName: 'เงินสด', catName: 'อาหาร',       note: 'ข้าวกลางวัน',         time: '12:30' },
  { date: '2026-04-05', type: 'expense',  amount: 45,    walletName: 'K-push', catName: 'เดินทาง',      note: 'รถไฟฟ้า',             time: '08:15' },
  { date: '2026-04-08', type: 'expense',  amount: 890,   walletName: 'SCB',    catName: 'ช้อปปิ้ง',     note: 'เสื้อผ้า',            time: '14:00' },
  { date: '2026-04-10', type: 'expense',  amount: 85,    walletName: 'เงินสด', catName: 'อาหาร',       note: 'อาหารเย็น',           time: '19:00' },
  { date: '2026-04-12', type: 'transfer', amount: 1000,  walletName: 'SCB',    toWalletName: 'เงินสด', note: 'ถอนเงินสด',           time: '11:00' },
  { date: '2026-04-15', type: 'expense',  amount: 650,   walletName: 'SCB',    catName: 'สาธารณูปโภค',  note: 'ค่าไฟ + น้ำ',       time: '10:00' },
  { date: '2026-04-18', type: 'expense',  amount: 200,   walletName: 'เงินสด', catName: 'อาหาร',       note: 'ข้าวกับเพื่อน',       time: '19:30' },
  { date: '2026-04-22', type: 'income',   amount: 5000,  walletName: 'K-push', catName: 'ฟรีแลนซ์',    note: 'งานออกแบบ',           time: '16:00' },
  { date: '2026-04-25', type: 'expense',  amount: 350,   walletName: 'SCB',    catName: 'บันเทิง',     note: 'ดูหนัง + ป๊อปคอร์น', time: '20:00' },
  { date: '2026-05-01', type: 'income',   amount: 25000, walletName: 'SCB',    catName: 'เงินเดือน',   note: 'เงินเดือนพฤษภาคม',   time: '09:00' },
  { date: '2026-05-04', type: 'expense',  amount: 150,   walletName: 'เงินสด', catName: 'อาหาร',       note: 'ข้าวกลางวัน',         time: '12:00' },
  { date: '2026-05-07', type: 'expense',  amount: 60,    walletName: 'K-push', catName: 'เดินทาง',      note: 'Grab',                time: '08:00' },
  { date: '2026-05-10', type: 'expense',  amount: 1200,  walletName: 'SCB',    catName: 'สุขภาพ',      note: 'ตรวจสุขภาพ',          time: '10:30' },
  { date: '2026-05-12', type: 'expense',  amount: 95,    walletName: 'เงินสด', catName: 'อาหาร',       note: 'อาหารเช้า + กาแฟ',   time: '08:30' },
  { date: '2026-05-15', type: 'transfer', amount: 2000,  walletName: 'SCB',    toWalletName: 'K-push', note: 'โอนเข้า K-push',      time: '13:00' },
  { date: '2026-05-18', type: 'expense',  amount: 1500,  walletName: 'SCB',    catName: 'ช้อปปิ้ง',     note: 'รองเท้า',             time: '15:00' },
  { date: '2026-05-20', type: 'expense',  amount: 180,   walletName: 'เงินสด', catName: 'อาหาร',       note: 'สุกี้กับครอบครัว',   time: '18:30' },
  { date: '2026-05-25', type: 'income',   amount: 3500,  walletName: 'K-push', catName: 'ฟรีแลนซ์',    note: 'งานเว็บ',             time: '17:00' },
  { date: '2026-05-28', type: 'expense',  amount: 280,   walletName: 'SCB',    catName: 'บันเทิง',     note: 'คอนเสิร์ต',           time: '19:00' },
  { date: '2026-06-01', type: 'income',   amount: 25000, walletName: 'SCB',    catName: 'เงินเดือน',   note: 'เงินเดือนมิถุนายน',   time: '09:00' },
  { date: '2026-06-05', type: 'expense',  amount: 130,   walletName: 'เงินสด', catName: 'อาหาร',       note: 'ข้าวกลางวัน',         time: '12:15' },
  { date: '2026-06-08', type: 'expense',  amount: 50,    walletName: 'K-push', catName: 'เดินทาง',      note: 'รถไฟฟ้า',             time: '07:45' },
]

async function resetDemoData(
  supabase: ReturnType<typeof createClient>,
  uid: string,
) {
  await supabase.from('transactions').delete().eq('user_id', uid)
  await supabase.from('wallets').delete().eq('user_id', uid)
  await supabase.from('categories').delete().eq('user_id', uid)
  const [{ data: wallets }, { data: cats }] = await Promise.all([
    supabase.from('wallets').insert(DEMO_WALLETS.map(w => ({ ...w, user_id: uid }))).select(),
    supabase.from('categories').insert(SEED_CATEGORIES.map(c => ({ ...c, user_id: uid }))).select(),
  ])
  if (!wallets || !cats) return
  const byWallet: Record<string, string> = {}
  wallets.forEach((w: { name: string; id: string }) => { byWallet[w.name] = w.id })
  const byCat: Record<string, string> = {}
  cats.forEach((c: { name: string; id: string }) => { byCat[c.name] = c.id })
  const rows = DEMO_TRANSACTIONS
    .map(t => ({
      user_id:      uid,
      wallet_id:    byWallet[t.walletName],
      to_wallet_id: t.toWalletName ? (byWallet[t.toWalletName] ?? null) : null,
      type:         t.type,
      amount:       t.amount,
      category_id:  t.catName ? (byCat[t.catName] ?? null) : null,
      note:         t.note ?? null,
      date:         t.date,
      time:         t.time ?? null,
    }))
    .filter(t => t.wallet_id)
  await supabase.from('transactions').insert(rows)
}

// ── types ─────────────────────────────────────────────────────────────────────

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
  wallets:      MockWallet[]
  totalBalance: number
  loading:      boolean
  categories:   Category[]
  displayName:  string
  userId:       string
  userEmail:    string
  isDemoUser:   boolean
  // wallet CRUD
  addWallet:    (data: NewWallet) => Promise<void>
  updateWallet: (id: string, updates: Partial<MockWallet>) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  // transaction CRUD
  transactions:      Transaction[]
  addTransaction:    (tx: NewTransaction) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, updates: NewTransaction) => Promise<void>
  // category CRUD
  addCategory:    (data: NewCategory) => Promise<void>
  deleteCategory: (id: string) => Promise<{ error?: string }>
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function useFinance(): FinanceContextType {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}

// ── helpers ───────────────────────────────────────────────────────────────────

type DeltaEntry = { id: string; delta: number }

function getDeltas(
  tx: Pick<Transaction, 'type' | 'amount' | 'wallet_id' | 'to_wallet_id'>
): DeltaEntry[] {
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
    return d ? { ...w, balance: Math.round((w.balance + d.delta) * 100) / 100 } : w
  })
}

function enrichTx(raw: Transaction, wallets: MockWallet[], cats: Category[]): Transaction {
  return {
    ...raw,
    wallet:    wallets.find(w => w.id === raw.wallet_id),
    to_wallet: raw.to_wallet_id ? wallets.find(w => w.id === raw.to_wallet_id) : undefined,
    category:  cats.find(c => c.id === raw.category_id),
  }
}

async function pushBalances(
  supabase: ReturnType<typeof createClient>,
  wallets: MockWallet[],
  ids: string[]
) {
  await Promise.all(
    ids.map(id => {
      const w = wallets.find(w => w.id === id)
      if (!w) return Promise.resolve()
      return supabase.from('wallets').update({ balance: w.balance }).eq('id', id)
    })
  )
}

// ── provider ──────────────────────────────────────────────────────────────────

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const supabase = useRef(createClient()).current

  const [wallets,      setWallets]      = useState<MockWallet[]>([])
  const [categories,   setCategories]   = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading,      setLoading]      = useState(true)
  const [displayName,  setDisplayName]  = useState('')
  const [userId,       setUserId]       = useState('')
  const [userEmail,    setUserEmail]    = useState('')
  const [isDemoUser,   setIsDemoUser]   = useState(false)

  useEffect(() => {
    // Track in-flight loads so a new auth event can cancel a stale one
    let currentLoad: { cancelled: boolean } | null = null

    async function loadForSession(session: Session, triggerEvent: string) {
      if (currentLoad) currentLoad.cancelled = true
      const thisLoad = { cancelled: false }
      currentLoad = thisLoad

      setLoading(true)

      const uid  = session.user.id
      const name = (session.user.user_metadata?.display_name as string | undefined)
        ?? session.user.email?.split('@')[0]
        ?? 'ผู้ใช้'

      const isDemo = session.user.email === DEMO_EMAIL
      if (!thisLoad.cancelled) {
        setUserId(uid)
        setDisplayName(name)
        setUserEmail(session.user.email ?? '')
        setIsDemoUser(isDemo)
      }
      if (isDemo && triggerEvent === 'SIGNED_IN') {
        await resetDemoData(supabase, uid)
        if (thisLoad.cancelled) return
      }

      // ── wallets ──────────────────────────────────────────────
      const { data: walletRows } = await supabase
        .from('wallets').select('*').eq('user_id', uid).order('created_at')
      if (thisLoad.cancelled) return

      let loadedWallets: MockWallet[] = []
      if (walletRows !== null && walletRows.length === 0) {
        const { data: seeded } = await supabase
          .from('wallets')
          .insert(SEED_WALLETS.map(w => ({ ...w, user_id: uid })))
          .select()
        if (seeded && !thisLoad.cancelled) loadedWallets = seeded as MockWallet[]
      } else if (walletRows) {
        loadedWallets = walletRows as MockWallet[]
      }
      if (!thisLoad.cancelled) setWallets(loadedWallets)

      // ── categories ───────────────────────────────────────────
      const { data: catRows } = await supabase
        .from('categories').select('*').eq('user_id', uid).order('created_at')
      if (thisLoad.cancelled) return

      let loadedCats: Category[] = []
      if (catRows !== null && catRows.length === 0) {
        const { data: seededCats } = await supabase
          .from('categories')
          .insert(SEED_CATEGORIES.map(c => ({ ...c, user_id: uid })))
          .select()
        if (seededCats && !thisLoad.cancelled) loadedCats = seededCats as Category[]
      } else if (catRows) {
        loadedCats = catRows as Category[]
      }
      if (!thisLoad.cancelled) setCategories(loadedCats)

      // ── transactions ─────────────────────────────────────────
      const { data: txRows } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .order('date',       { ascending: false })
        .order('created_at', { ascending: false })
      if (thisLoad.cancelled) return

      if (txRows) setTransactions(txRows.map(r => enrichTx(r, loadedWallets, loadedCats)))
      if (!thisLoad.cancelled) setLoading(false)
    }

    function clearState() {
      if (currentLoad) currentLoad.cancelled = true
      setWallets([])
      setCategories([])
      setTransactions([])
      setDisplayName('')
      setUserId('')
      setUserEmail('')
      setIsDemoUser(false)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          clearState()
          return
        }
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await loadForSession(session, event)
        }
        // TOKEN_REFRESHED: session is already valid, no reload needed
      }
    )

    return () => {
      if (currentLoad) currentLoad.cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0)

  // ── wallet mutations ──────────────────────────────────────────────────────

  const addWallet = async (data: NewWallet) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: inserted, error } = await supabase
      .from('wallets')
      .insert({ ...data, user_id: session.user.id })
      .select()
      .single()
    if (!error && inserted) setWallets(prev => [...prev, inserted as MockWallet])
  }

  const updateWallet = async (id: string, updates: Partial<MockWallet>) => {
    const { error } = await supabase
      .from('wallets')
      .update({
        name:    updates.name,
        balance: updates.balance,
        color:   updates.color,
        bg:      updates.bg ?? (updates.color ? updates.color + '15' : undefined),
        icon:    updates.icon,
      })
      .eq('id', id)
    if (!error) setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const deleteWallet = async (id: string) => {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) return
    setWallets(prev => prev.filter(w => w.id !== id))
    // cascade-deleted by DB, mirror in local state
    setTransactions(prev => prev.filter(
      t => t.wallet_id !== id && t.to_wallet_id !== id
    ))
  }

  // ── transaction mutations ─────────────────────────────────────────────────

  const addTransaction = async (newTx: NewTransaction): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const deltas = getDeltas(newTx)
    const next   = applyDeltas(wallets, deltas)

    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert({
        user_id:      session.user.id,
        wallet_id:    newTx.wallet_id,
        to_wallet_id: newTx.to_wallet_id,
        type:         newTx.type,
        amount:       newTx.amount,
        category_id:  newTx.category_id,
        note:         newTx.note,
        date:         newTx.date,
        time:         newTx.time ?? null,
      })
      .select()
      .single()

    if (error || !inserted) return false

    await pushBalances(supabase, next, deltas.map(d => d.id))
    setWallets(next)
    setTransactions(prev => [enrichTx(inserted, next, categories), ...prev])
    return true
  }

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id)
    if (!tx) return

    const reverseDeltas = getDeltas(tx).map(d => ({ ...d, delta: -d.delta }))
    const next          = applyDeltas(wallets, reverseDeltas)

    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return

    await pushBalances(supabase, next, reverseDeltas.map(d => d.id))
    setWallets(next)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const updateTransaction = async (id: string, updates: NewTransaction) => {
    const old = transactions.find(t => t.id === id)
    if (!old) return

    const reverseDeltas = getDeltas(old).map(d => ({ ...d, delta: -d.delta }))
    const newDeltas     = getDeltas(updates)
    const next          = applyDeltas(applyDeltas(wallets, reverseDeltas), newDeltas)

    const { error } = await supabase
      .from('transactions')
      .update({
        wallet_id:    updates.wallet_id,
        to_wallet_id: updates.to_wallet_id,
        type:         updates.type,
        amount:       updates.amount,
        category_id:  updates.category_id,
        note:         updates.note,
        date:         updates.date,
        time:         updates.time ?? null,
      })
      .eq('id', id)

    if (error) return

    const affectedIds = Array.from(
      new Set([...reverseDeltas.map(d => d.id), ...newDeltas.map(d => d.id)])
    )
    await pushBalances(supabase, next, affectedIds)
    setWallets(next)
    setTransactions(prev =>
      prev.map(t => t.id !== id ? t : enrichTx({ ...t, ...updates }, next, categories))
    )
  }

  // ── category mutations ────────────────────────────────────────────────────

  const addCategory = async (data: NewCategory) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: inserted, error } = await supabase
      .from('categories')
      .insert({ ...data, user_id: session.user.id })
      .select()
      .single()
    if (!error && inserted) setCategories(prev => [...prev, inserted as Category])
  }

  const deleteCategory = async (id: string): Promise<{ error?: string }> => {
    const inUse = transactions.some(t => t.category_id === id)
    if (inUse) return { error: 'มีรายการใช้หมวดหมู่นี้อยู่ ไม่สามารถลบได้' }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }

    setCategories(prev => prev.filter(c => c.id !== id))
    return {}
  }

  return (
    <FinanceContext.Provider value={{
      wallets, totalBalance, loading, categories, displayName, userId, userEmail, isDemoUser,
      addWallet, updateWallet, deleteWallet,
      transactions, addTransaction, deleteTransaction, updateTransaction,
      addCategory, deleteCategory,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}
