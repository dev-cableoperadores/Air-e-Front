import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import facturasService from '../../services/facturasService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Loading from '../../components/UI/Loading'
import { formatDate, formatNumber, formatMonthYear, formatDecimal, formatMonthYearString } from '../../utils/formatters'

const FacturasByCableoperador = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [loading, setLoading] = useState(true)
	const [facturas, setFacturas] = useState([])
	const [cableoperador, setCableoperador] = useState(null)
	const [filtros, setFiltros] = useState({
		search: '',
		estado: '',
	})
	const [pagination, setPagination] = useState({
		count: 0,
		next: null,
		previous: null,
	})
	const [currentPage, setCurrentPage] = useState(1)

	// Cargar información del cableoperador
	useEffect(() => {
		const loadCableoperador = async () => {
			try {
				const data = await cableoperadoresService.getById(id)
				setCableoperador(data)
			} catch (error) {
				toast.error('Error al cargar información del cableoperador')
			}
		}
		loadCableoperador()
	}, [id])

	// Cargar facturas del cableoperador
	useEffect(() => {
		loadFacturas()
	}, [currentPage])

	const loadFacturas = async () => {
		try {
			setLoading(true)
			const params = { cableoperador: id }
			if (currentPage > 1) params.page = currentPage

			// Traer todas las facturas del cableoperador, página por página
			const data = await facturasService.getAllFull(params)
			setFacturas(data.results || [])
			setPagination({
				count: data.count,
				next: data.next,
				previous: data.previous,
			})
		} catch (error) {
			toast.error('Error al cargar facturas del cableoperador')
		} finally {
			setLoading(false)
		}
	}

	const handleFiltroChange = (e) => {
		const { name, value } = e.target
		setFiltros({ ...filtros, [name]: value })
		setCurrentPage(1)
	}

	const handleDelete = async (facturaId) => {
		if (window.confirm('¿Estás seguro de eliminar esta factura?')) {
			try {
				await facturasService.delete(facturaId)
				toast.success('Factura eliminada')
				loadFacturas()
			} catch (error) {
				toast.error('Error al eliminar factura')
			}
		}
	}

	if (loading && facturas.length === 0) {
		return <Loading fullScreen />
	}

	const itemsPerPage = 10
	const totalPages = Math.ceil(pagination.count / itemsPerPage)

	// Aplicar filtros en cliente
	const filteredFacturas = facturas.filter((factura) => {
		const term = (filtros.search || '').toLowerCase()
		const matchesSearch = !term || (
			String(factura.Num_factura || '').toLowerCase().includes(term)
		)

		const matchesEstado = !filtros.estado || factura.estado === filtros.estado

		return matchesSearch && matchesEstado
	})

	const getEstadoColor = (estado) => {
		const colors = {
			'Pendiente': 'text-yellow-600 bg-yellow-50',
			'PagadaParcial': 'text-blue-600 bg-blue-50',
			'Pagada': 'text-green-600 bg-green-50',
			'Anulada': 'text-red-600 bg-red-50',
		}
		return colors[estado] || 'text-gray-600 bg-gray-50'
	}

	// Calcular totales
	const totalFacturado = filteredFacturas.reduce((sum, f) => sum + (parseFloat(f.Valor_facturado_iva) || 0), 0)
	const totalPagado = filteredFacturas.reduce((sum, f) => sum + (parseFloat(f.monto_pagado) || 0), 0)
	const totalPendiente = filteredFacturas.reduce((sum, f) => sum + (parseFloat(f.monto_pendiente) || 0), 0)

	return (
		<div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
			{/* Header con botón de atrás */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-0">
				<div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1">
					<button
						onClick={() => navigate(`/cableoperadores/${id}/detalle`)}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 mt-0.5"
						title="Volver"
					>
						<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
					</button>
					<div className="min-w-0 flex-1">
						<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 truncate">
							Facturas de {cableoperador?.nombre || 'Cargando...'}
						</h2>
						<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
							ID: {cableoperador?.id}
						</p>
					</div>
				</div>
				<Button onClick={() => navigate('/facturas/nueva')} variant="primary" className="w-full sm:w-auto text-xs sm:text-sm">
					Nueva Factura
				</Button>
			</div>

			{/* Resumen de totales */}
			{filteredFacturas.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mx-2 sm:mx-0">
					<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4">
						<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Facturado</p>
						<p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2">
							${formatDecimal(totalFacturado)}
						</p>
					</div>
					<div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-3 sm:p-4">
						<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pagado</p>
						<p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">
							${formatDecimal(totalPagado)}
						</p>
					</div>
					<div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 p-3 sm:p-4">
						<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pendiente</p>
						<p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1 sm:mt-2">
							${formatDecimal(totalPendiente)}
						</p>
					</div>
				</div>
			)}

			{/* Filtros */}
			<div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 mx-2 sm:mx-0">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
					<Input
						label="Buscar por Número de Factura"
						name="search"
						type="text"
						placeholder="Número de factura..."
						value={filtros.search}
						onChange={handleFiltroChange}
						className="text-xs sm:text-sm"
					/>
					<Select
						label="Estado"
						name="estado"
						value={filtros.estado}
						onChange={handleFiltroChange}
						options={[
							{ value: '', label: 'Todos' },
							{ value: 'Pendiente', label: 'Pendiente' },
							{ value: 'PagadaParcial', label: 'Pago Parcial' },
							{ value: 'Pagada', label: 'Pagada' },
							{ value: 'Anulada', label: 'Anulada' },
						]}
						className="text-xs sm:text-sm"
					/>
				</div>
			</div>

			{/* Tabla de facturas */}
			<div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden mx-2 sm:mx-0">
				{facturas.length === 0 ? (
					<div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
						No hay facturas registradas para este cableoperador
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-xs sm:text-sm">
							<thead className="bg-blue-100 dark:bg-blue-900/30 border-b border-blue-300 dark:border-blue-600">
								<tr>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
										Nº Factura
									</th>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
										Mes de Uso
									</th>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
										Valor
									</th>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">
										Pagado
									</th>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">
										Pendiente
									</th>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
										Estado
									</th>
									<th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
										Aceptada
									</th>
									<th className="px-2 sm:px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredFacturas.map((factura) => (
									<tr key={factura.id} className="border-b border-blue-200 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
										<td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 font-semibold">
											{factura.Num_factura}
										</td>
										<td className="px-2 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hidden sm:table-cell">
											{formatMonthYearString(factura.Mes_uso)}
										</td>
										<td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 font-semibold">
											${formatDecimal(factura.Valor_facturado_iva)}
										</td>
										<td className="px-2 sm:px-4 py-2 text-green-600 dark:text-green-400 font-semibold hidden md:table-cell">
											${formatDecimal(factura.monto_pagado)}
										</td>
										<td className="px-2 sm:px-4 py-2 text-red-600 dark:text-red-400 font-semibold hidden lg:table-cell">
											${formatDecimal(factura.monto_pendiente)}
										</td>
										<td className="px-2 sm:px-4 py-2">
											<span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(factura.estado)}`}>
												{factura.estado}
											</span>
										</td>
										<td className="px-2 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hidden sm:table-cell">
											{factura.Factura_aceptada ? 'Sí' : 'No'}
										</td>
										<td className="px-2 sm:px-4 py-2">
											<div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
												<Button
													size="sm"
													variant="secondary"
													onClick={() => navigate(`/facturas/${factura.id}`)}
													className="text-xs"
												>
													Ver
												</Button>
												<Button
													size="sm"
													variant="primary"
													onClick={() => navigate(`/facturas/${factura.id}/editar`)}
													className="text-xs"
												>
													Editar
												</Button>
												<Button
													size="sm"
													variant="danger"
													onClick={() => handleDelete(factura.id)}
													className="text-xs"
												>
													Eliminar
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Paginación */}
			{totalPages > 1 && (
				<div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-6 mx-2 sm:mx-0">
					<Button
						variant="outline"
						onClick={() => setCurrentPage(1)}
						disabled={currentPage === 1}
						className="w-full sm:w-auto text-xs sm:text-sm"
					>
						Primera
					</Button>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
						disabled={!pagination.previous}
						className="w-full sm:w-auto text-xs sm:text-sm"
					>
						Anterior
					</Button>
					<span className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
						Página {currentPage} de {totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(p => p + 1)}
						disabled={!pagination.next}
						className="w-full sm:w-auto text-xs sm:text-sm"
					>
						Siguiente
					</Button>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(totalPages)}
						disabled={currentPage === totalPages}
						className="w-full sm:w-auto text-xs sm:text-sm"
					>
						Última
					</Button>
				</div>
			)}
		</div>
	)
}

export default FacturasByCableoperador
