import { useState, useEffect, useRef } from 'react'

const SearchableSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = 'Seleccionar...',
  className = '',
}) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState(options)
  const containerRef = useRef(null)

  useEffect(() => {
    setFiltered(options)
  }, [options])

  useEffect(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      setFiltered(options)
      return
    }
    setFiltered(
      options.filter((o) =>
        String(o.label || o.value).toLowerCase().includes(term) ||
        String(o.value || '').toLowerCase().includes(term)
      )
    )
  }, [query, options])

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleSelect = (val) => {
    onChange && onChange({ target: { name, value: val } })
    setOpen(false)
    setQuery('')
  }

  // Find label for current value
  const currentLabel = (() => {
    const found = options.find((o) => String(o.value) === String(value))
    return found ? found.label : ''
  })()

  return (
    <div className="mb-4" ref={containerRef}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={`relative ${className}`}>
        <input
          type="text"
          id={name}
          value={open ? query : currentLabel}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
          readOnly={false}
        />

        <input type="hidden" name={name} value={value || ''} />

        {open && (
          <div className="absolute z-40 mt-1 w-full bg-white border rounded-lg max-h-60 overflow-auto shadow-lg">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No hay opciones</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${String(opt.value) === String(value) ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchableSelect
