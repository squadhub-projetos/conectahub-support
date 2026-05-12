import './PageCornerLoginTrigger.css'

interface PageCornerLoginTriggerProps {
  onClick: () => void
}

export default function PageCornerLoginTrigger({ onClick }: PageCornerLoginTriggerProps) {
  return (
    <button
      type="button"
      className="corner-trigger"
      onClick={onClick}
      title="Acesso ao editor"
      aria-label="Acesso ao editor"
    />
  )
}
