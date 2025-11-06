// C:\Air-e\src\components\UI\Textarea.jsx
const Textarea = ({ 
    label,      // Eliminado el duplicado
    name,
    // Se elimina 'type' si el componente SIEMPRE es un textarea,
    // pero lo dejamos para usar el operador 'rest' si es necesario.
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    className = '',
    // Se añade 'rows' para control de altura, con un valor por defecto.
    rows = 4, 
    ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea // <-- ¡Cambiado de <input> a <textarea>!
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows} // <-- Añadida la propiedad clave para la altura
        className={`
          w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Textarea;