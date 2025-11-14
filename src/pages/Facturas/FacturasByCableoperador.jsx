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
import { formatDate, formatNumber, formatMonthYear } from '../../utils/formatters'

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
	const totalFacturado = filteredFacturas.reduce((sum, f) => sum + (f.Valor_facturado_iva || 0), 0)
	const totalPagado = filteredFacturas.reduce((sum, f) => sum + (f.monto_pagado || 0), 0)
	const totalPendiente = filteredFacturas.reduce((sum, f) => sum + (f.monto_pendiente || 0), 0)

	return (
		<div className="max-w-6xl mx-auto">
			{/* Header con botón de atrás */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate(`/cableoperadores/${id}/detalle`)}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						title="Volver"
					>
						<ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					</button>
					<div>
						<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
							Facturas de {cableoperador?.nombre || 'Cargando...'}
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							ID: {cableoperador?.id}
						</p>
					</div>
				</div>
				<Button onClick={() => navigate('/facturas/nueva')} variant="primary">
					Nueva Factura
				</Button>
			</div>

			{/* Resumen de totales */}
			{filteredFacturas.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
						<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Facturado</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
							${formatNumber(totalFacturado)}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
						<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pagado</p>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
							${formatNumber(totalPagado)}
						</p>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-red-500">
						<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Pendiente</p>
						<p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
							${formatNumber(totalPendiente)}
						</p>
					</div>
				</div>
			)}

			{/* Filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						label="Buscar por Número de Factura"
						name="search"
						type="text"
						placeholder="Número de factura..."
						value={filtros.search}
						onChange={handleFiltroChange}
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
					/>
				</div>
			</div>

			{/* Tabla de facturas */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
				{facturas.length === 0 ? (
					<div className="p-6 text-center text-gray-500 dark:text-gray-400">
						No hay facturas registradas para este cableoperador
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700 border-b">
								<tr>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
										Nº Factura
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
										Mes de Uso
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
										Valor Facturado
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
										Monto Pagado
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
										Monto Pendiente
									</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
										Estado
									</th>
									<th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredFacturas.map((factura) => (
									<tr key={factura.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
										<td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-semibold">
											{factura.Num_factura}
										</td>
									<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
										{formatMonthYear(factura.Mes_uso)}
									</td>
										<td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-semibold">
											${formatNumber(factura.Valor_facturado_iva)}
										</td>
										<td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-semibold">
											${formatNumber(factura.monto_pagado)}
										</td>
										<td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 font-semibold">
											${formatNumber(factura.monto_pendiente)}
										</td>
										<td className="px-6 py-4">
											<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(factura.estado)}`}>
												{factura.estado}
											</span>
										</td>
										<td className="px-6 py-4 text-center">
											<div className="flex gap-2 justify-center">
												<Button
													size="sm"
													variant="secondary"
													onClick={() => navigate(`/facturas/${factura.id}`)}
												>
													Ver
												</Button>
												<Button
													size="sm"
													variant="primary"
													onClick={() => navigate(`/facturas/${factura.id}/editar`)}
												>
													Editar
												</Button>
												<Button
													size="sm"
													variant="danger"
													onClick={() => handleDelete(factura.id)}
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
				<div className="flex justify-center gap-2 mt-6">
					<Button
						variant="outline"
						onClick={() => setCurrentPage(1)}
						disabled={currentPage === 1}
					>
						Primera
					</Button>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
						disabled={!pagination.previous}
					>
						Anterior
					</Button>
					<span className="px-4 py-2 text-gray-700 dark:text-gray-300">
						Página {currentPage} de {totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(p => p + 1)}
						disabled={!pagination.next}
					>
						Siguiente
					</Button>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(totalPages)}
						disabled={currentPage === totalPages}
					>
						Última
					</Button>
				</div>
			)}
		</div>
	)
}

export default FacturasByCableoperador
