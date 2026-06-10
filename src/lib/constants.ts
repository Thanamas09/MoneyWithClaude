import type { Category } from './supabase/types'

export const WALLETS_CONFIG = [
  { key: 'cash',   name: 'เงินสด',    color: '#639922', bg: '#EAF3DE', icon: '💵' },
  { key: 'true',   name: 'TrueMoney', color: '#BA7517', bg: '#FAEEDA', icon: '📱' },
  { key: 'kpush1', name: 'K-push 1',  color: '#185FA5', bg: '#E6F1FB', icon: '🏦' },
  { key: 'kpush2', name: 'K-push 2',  color: '#185FA5', bg: '#E6F1FB', icon: '🏦' },
  { key: 'scb1',   name: 'SCB 1',     color: '#534AB7', bg: '#EEEDFE', icon: '🏛' },
  { key: 'scb2',   name: 'SCB 2',     color: '#534AB7', bg: '#EEEDFE', icon: '🏛' },
]

export const EXPENSE_CATEGORIES: Category[] = [
  { id: '1',  name: 'อาหาร',       type: 'expense', icon: '🍔', color: '#EF9F27' },
  { id: '2',  name: 'เดินทาง',     type: 'expense', icon: '🚌', color: '#378ADD' },
  { id: '3',  name: 'ช้อปปิ้ง',    type: 'expense', icon: '🛍', color: '#D4537E' },
  { id: '4',  name: 'สาธารณูปโภค', type: 'expense', icon: '💡', color: '#639922' },
  { id: '5',  name: 'สุขภาพ',      type: 'expense', icon: '🏥', color: '#7F77DD' },
  { id: '6',  name: 'บันเทิง',     type: 'expense', icon: '🎬', color: '#E8593C' },
  { id: '7',  name: 'อื่นๆ',       type: 'expense', icon: '📦', color: '#888780' },
]

export const INCOME_CATEGORIES: Category[] = [
  { id: '8',  name: 'เงินเดือน', type: 'income', icon: '💼', color: '#1D9E75' },
  { id: '9',  name: 'ฟรีแลนซ์', type: 'income', icon: '💻', color: '#0F6E56' },
  { id: '10', name: 'อื่นๆ',     type: 'income', icon: '➕', color: '#639922' },
]

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export const formatCurrency = (amount: number) =>
  `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
