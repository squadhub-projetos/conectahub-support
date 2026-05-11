import type { ReactNode } from 'react'
import './GuideContent.css'

interface GuideContentProps {
  content: string
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

function parseContent(content: string): ReactNode[] {
  const lines = content.split('\n')
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++}>{line.slice(3)}</h2>)
      i++
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++}>{line.slice(4)}</h3>)
      i++
    } else if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={key++} className="guide-callout">
          {renderInline(line.slice(2))}
        </blockquote>
      )
      i++
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={key++}>
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      )
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      nodes.push(
        <ol key={key++}>
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ol>
      )
    } else if (line.trim() === '') {
      i++
    } else {
      nodes.push(<p key={key++}>{renderInline(line)}</p>)
      i++
    }
  }

  return nodes
}

export default function GuideContent({ content }: GuideContentProps) {
  return (
    <div className="guide-content">
      {parseContent(content)}
    </div>
  )
}
