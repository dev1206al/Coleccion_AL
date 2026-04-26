import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  otherPlaceholder?: string
  className?: string
}

const OTRA = '__otra__'

export default function SelectWithOther({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  otherPlaceholder = 'Especificar...',
  className,
}: Props) {
  const isKnownOption = options.includes(value)
  const [showOther, setShowOther] = useState(!isKnownOption && value !== '')
  const [customText, setCustomText] = useState(!isKnownOption ? value : '')

  // Si el padre resetea el value a '' (ej. al cambiar categoría), resetear estado interno
  useEffect(() => {
    if (value === '') {
      setShowOther(false)
      setCustomText('')
    }
  }, [value])

  const selectValue = showOther ? OTRA : value

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v === OTRA) {
      setShowOther(true)
      setCustomText('')
      onChange('')
    } else {
      setShowOther(false)
      setCustomText('')
      onChange(v)
    }
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setCustomText(v)
    onChange(v)
  }

  const inputClass = cn(
    'w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring',
    className,
  )

  return (
    <div className="space-y-2">
      <select value={selectValue} onChange={handleSelect} className={inputClass}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value={OTRA}>Otra / Otro</option>
      </select>
      {showOther && (
        <input
          type="text"
          value={customText}
          onChange={handleCustomChange}
          placeholder={otherPlaceholder}
          className={inputClass}
          autoFocus
        />
      )}
    </div>
  )
}
