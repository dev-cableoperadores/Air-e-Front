import toast from "react-hot-toast";
import api from "../utils/api";

// esto funciona con fecthProyectos

export const ExportarExcelKmz = async (kmzId, filename) => {
    try {
        toast.loading('Generando archivo Excel...', { id: 'exportExcel' });
        const response = await api.get(`/api/coordenadas/exportar-gps/${kmzId}/`, {
            responseType: 'blob', // Importante para manejar archivos binarios
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const filname = `${filename.replace('.kmz', '')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success.apply('Excel descargado exitosamente', {id: 'export'});
    } catch (error){
        console.error('Error exportando Excel', error);
        if (error.response?.status === 404) {
            toast.error('No hay datos para exportar en este kmz', {id: 'export'});
        } else {
            toast.error('Error al generar archivo excel', {id:'export'})
        }
    }
}

export const ExportarExcelInventario = async (proyectoId, proyectoName) => {
    try {
        toast.loading('Generando archivo Excel...', { id: 'exportExcel' });
        const response = await api.get(`/api/coordenadas/exportar-inventario/${proyectoId}`, {
            responseType: 'blob', // Importante para manejar archivos binarios
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const filname = `Inventario_${proyectoName}.xlsx`;
        link.setAttribute('download', filname);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Excel descargado exitosamente', {id: 'export'});
    } catch (error){
        console.error('Error exportando Excel', error);
        if (error.response?.status === 404) {
            toast.error('No hay datos para exportar en este proyecto', {id: 'export'});
        } else {
            toast.error('Error al generar archivo excel', {id:'export'})
        }
    }
}

// Se exporta los de hoy por proyecto

export const ExportarExcelInventarioHoy = async (proyectoId, proyectoName) => {
    try {
        toast.loading('Generando archivo Excel...', { id: 'exportExcel' });
        const response = await api.get(`/api/coordenadas/exportar-inventario-hoy/${proyectoId}`, {
            responseType: 'blob', // Importante para manejar archivos binarios
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const filname = `Inventario_${proyectoName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        link.setAttribute('download', filname);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Excel descargado exitosamente', {id: 'export'});
    } catch (error){
        console.error('Error exportando Excel', error);
        if (error.response?.status === 404) {
            toast.error('No hay datos para exportar en este proyecto', {id: 'export'});
        } else {
            toast.error('Error al generar archivo excel', {id:'export'})
        }
    }
}

export const ExportarExcelInventarioAllHoy = async () => {
    try {
        toast.loading('Generando archivo Excel...', { id: 'exportExcel' });
        const response = await api.get(`/api/coordenadas/exportar-inventario-hoy/`, {
            responseType: 'blob', // Importante para manejar archivos binarios
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const filname = `Inventario_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        link.setAttribute('download', filname);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Excel descargado exitosamente', {id: 'export'});
    } catch (error){
        console.error('Error exportando Excel', error);
        if (error.response?.status === 404) {
            toast.error('No hay datos para exportar en este proyecto', {id: 'export'});
        } else {
            toast.error('Error al generar archivo excel', {id:'export'})
        }
    }
}