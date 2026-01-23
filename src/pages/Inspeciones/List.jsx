import { useState, useEffect } from 'react'


// Por el momento esta vista mostrara que solo puede ver las inspecciones el usuario con is_inspector = true
const InspeccionesList = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inspecciones</h1>
      <p>Esta es la lista de inspecciones. Solo los usuarios con permisos de inspector pueden ver esta sección.</p>
    </div>
  )
}
export default InspeccionesList