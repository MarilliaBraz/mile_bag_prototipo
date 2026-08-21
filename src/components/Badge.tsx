interface BadgeProps {
  label: string
  className?: string
}

export default function Badge({ label, className = 'bg-slate-100 text-slate-700' }: BadgeProps) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}
