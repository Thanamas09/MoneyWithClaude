export const WALLETS_CONFIG = [
  { key: 'cash',   name: 'เงินสด',    color: '#639922', bg: '#EAF3DE', icon: '💵' },
  { key: 'true',   name: 'TrueMoney', color: '#BA7517', bg: '#FAEEDA', icon: '📱' },
  { key: 'kpush1', name: 'K-push 1',  color: '#185FA5', bg: '#E6F1FB', icon: '🏦' },
  { key: 'kpush2', name: 'K-push 2',  color: '#185FA5', bg: '#E6F1FB', icon: '🏦' },
  { key: 'scb1',   name: 'SCB 1',     color: '#534AB7', bg: '#EEEDFE', icon: '🏛' },
  { key: 'scb2',   name: 'SCB 2',     color: '#534AB7', bg: '#EEEDFE', icon: '🏛' },
]

export const formatCurrency = (amount: number) =>
  `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
