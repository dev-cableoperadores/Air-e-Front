const Checkbox = ({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  error,
  className = '',
  containerClassName = '',
  ...props
}) => {
  // Aseguramos un ID único para enlazar el label con el input
  const checkboxId = id || name || Math.random().toString(36).substr(2, 9)

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      <label
        htmlFor={checkboxId}
        className={`flex items-center space-x-2 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 
            dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-primary dark:checked:border-primary transition-colors
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
      {error && <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Checkbox