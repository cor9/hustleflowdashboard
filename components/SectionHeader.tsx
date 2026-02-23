import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  const content = (
    <div className="flex items-center justify-between gap-4 mb-3 mt-5 first:mt-0">
      <div className="flex items-center gap-3">
        <h2 className="font-mono text-xs font-bold tracking-wider text-hf-muted uppercase">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-hf-border to-transparent w-8" />
      </div>
      {action && (
        action.href ? (
          <Link href={action.href} className="font-mono text-xs text-hf-accent hover:text-hf-head transition whitespace-nowrap">
            {action.label} →
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="font-mono text-xs text-hf-accent hover:text-hf-head transition whitespace-nowrap"
          >
            {action.label} →
          </button>
        )
      )}
    </div>
  )

  return content
}
