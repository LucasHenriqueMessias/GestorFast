import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DataGridPro, GridColDef, GridRowsProp } from '@mui/x-data-grid-pro';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Checkbox, FormControlLabel, Paper, Card, CardContent, Autocomplete } from '@mui/material';
import { CloudUpload, FileDownload, Print, Add } from '@mui/icons-material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import * as XLSX from 'xlsx';

interface PresencaData {
  id?: number;
  nome_participante?: string;
  nome_evento?: string;
  nome_empresa?: string;
  telefone?: string;
  presenca?: boolean;
}

const ListaPresenca = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(false);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editData, setEditData] = useState<PresencaData>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<PresencaData>({
    nome_participante: '',
    nome_evento: '',
    nome_empresa: '',
    telefone: '',
    presenca: false,
  });
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadEventName, setUploadEventName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [, setStatistics] = useState({
    totalParticipants: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0
  });
  const [events, setEvents] = useState<string[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');

  const displayedRows = useMemo(() => {
    let data = rows as any[];
    if (selectedEventFilter) {
      data = data.filter(r => (r.nome_evento || '') === selectedEventFilter);
    }
    if (searchName && searchName.trim() !== '') {
      const q = searchName.trim().toLowerCase();
      data = data.filter(r => (r.nome_participante || '').toLowerCase().includes(q));
    }
    return data;
  }, [rows, selectedEventFilter, searchName]);
  const displayedStatistics = useMemo(() => {
    const data = displayedRows as any[];
    const total = data.length;
    const present = data.filter(item => item.presenca === true).length;
    const absent = total - present;
    const rate = total > 0 ? (present / total) * 100 : 0;
    return {
      totalParticipants: total,
      presentCount: present,
      absentCount: absent,
      attendanceRate: Math.round(rate * 100) / 100
    };
  }, [displayedRows]);

  const updateStatistics = useCallback((data: any[]) => {
    const total = data.length;
    const present = data.filter(item => item.presenca === true).length;
    const absent = total - present;
    const rate = total > 0 ? (present / total) * 100 : 0;

    setStatistics({
      totalParticipants: total,
      presentCount: present,
      absentCount: absent,
      attendanceRate: Math.round(rate * 100) / 100
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-evento-presenca/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data.map((item: PresencaData, index: number) => ({
        id: item.id || index + 1,
        nome_participante: item.nome_participante || '',
        nome_evento: item.nome_evento || '',
        nome_empresa: item.nome_empresa || '',
        telefone: item.telefone || '',
        presenca: item.presenca || false,
      }));
      
      setRows(data);
      updateStatistics(data);
    } catch (error) {
      console.error('Erro ao buscar dados de presença:', error);
      alert('Erro ao carregar lista de presença');
    } finally {
      setLoading(false);
    }
  }, [updateStatistics]);

  const fetchEvents = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-evento/evento`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Expecting response.data to be array of objects like { nome_evento: string }
      const names = Array.isArray(response.data) ? response.data.map((it: any) => it.nome_evento).filter(Boolean) : [];
      setEvents(names);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, [fetchData, fetchEvents]);

 

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleEditChange = useCallback((field: string, value: any) => {
    setEditData((prev: PresencaData) => ({ ...prev, [field]: value }));
  }, []);

 

  const handleSaveEdit = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/tab-evento-presenca/${editData.id}/`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedRows = rows.map((row: any) => 
        row.id === editRowId ? { ...row, ...editData } : row
      );
      setRows(updatedRows);
      updateStatistics(updatedRows);
      
      setEditRowId(null);
      setEditData({});
      setOpenEditDialog(false);
      alert('Presença atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
      alert('Erro ao atualizar presença');
    } finally {
      setLoading(false);
    }
  }, [editData, editRowId, rows, updateStatistics]);

  const handleOpenEditDialogForRow = (row: any) => {
    setEditRowId(row.id?.toString() || '');
    setEditData({ ...row });
    setOpenEditDialog(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNew = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tab-evento-presenca/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newRow = {
        id: response.data.id || rows.length + 1,
        ...formData
      };
      
      const updatedRows = [...rows, newRow];
      setRows(updatedRows);
      updateStatistics(updatedRows);
      setFormData({
        nome_participante: '',
        nome_evento: '',
        nome_empresa: '',
        telefone: '',
        presenca: false,
      });
      setOpenDialog(false);
      alert('Participante adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      alert('Erro ao adicionar participante');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este registro de presença?')) {
      return;
    }

    setLoading(true);
    try {
      const token = getAccessToken();
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/tab-evento-presenca/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedRows = rows.filter((row: any) => row.id !== id);
      setRows(updatedRows);
      updateStatistics(updatedRows);
      alert('Registro excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      alert('Erro ao excluir registro');
    } finally {
      setLoading(false);
    }
  }, [rows, updateStatistics]);

  const togglePresence = useCallback(async (id: any, newValue: boolean) => {
    setLoading(true);
    try {
      const token = getAccessToken();
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/tab-evento-presenca/${id}/`,
        { presenca: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRows = rows.map((row: any) => (row.id === id ? { ...row, presenca: newValue } : row));
      setRows(updatedRows);
      updateStatistics(updatedRows);
    } catch (error) {
      console.error('Erro ao alternar presença:', error);
      alert('Erro ao atualizar presença');
    } finally {
      setLoading(false);
    }
  }, [rows, updateStatistics]);

  // Expose togglePresence on window so column renderers can call it safely
  useEffect(() => {
    (window as any).__togglePresence = togglePresence;
    return () => { (window as any).__togglePresence = undefined; };
  }, [togglePresence]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const processExcelFile = async () => {
    if (!uploadFile || !uploadEventName.trim()) {
      alert('Por favor, selecione um arquivo e informe o nome do evento');
      return;
    }

    setLoading(true);
    try {
      const data = await uploadFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and process data
      const participants = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (row[0]) { // If there's a name
          participants.push({
            nome_participante: row[0]?.toString() || '',
            nome_empresa: row[1]?.toString() || '',
            telefone: row[2]?.toString() || '',
            nome_evento: uploadEventName,
            presenca: false
          });
        }
      }

      // Send all participants to API
      const token = getAccessToken();
      const promises = participants.map(participant =>
        axios.post(
          `${process.env.REACT_APP_API_URL}/tab-evento-presenca/`,
          participant,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      
      // Refresh data
      await fetchData();
      
      setOpenUploadDialog(false);
      setUploadFile(null);
      setUploadEventName('');
      alert(`${participants.length} participantes importados com sucesso!`);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar arquivo Excel');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = (displayedRows as any[]).map((row: any) => ({
      'Nome Completo': row.nome_participante,
      'Empresa/Instituição': row.nome_empresa,
      'Telefone': row.telefone,
      'Evento': row.nome_evento,
      'Presente': row.presenca ? 'Sim' : 'Não'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Presença');
    XLSX.writeFile(wb, `lista_presenca_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'nome_participante',
      headerName: 'Nome Completo',
      headerClassName: 'report-header',
      flex: 2,
      minWidth: 220
    },
    {
      field: 'nome_empresa',
      headerName: 'Empresa/Instituição',
      headerClassName: 'report-header',
      flex: 1.5,
      minWidth: 180
    },
    {
      field: 'telefone',
      headerName: 'Telefone',
      headerClassName: 'report-header',
      flex: 0.9,
      minWidth: 140
    },
    {
      field: 'presenca',
      headerName: 'Status',
      headerClassName: 'report-header',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params: any) => {
        const isPresent = !!params.value;
        const id = params.row?.id;
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              if (id !== undefined) {
                if ((window as any).__togglePresence) {
                  (window as any).__togglePresence(id, !isPresent);
                }
              }
            }}
            sx={{
              textTransform: 'none',
              backgroundColor: isPresent ? '#e8f5e8' : '#ffe8e8',
              color: isPresent ? '#2e7d32' : '#d32f2f',
              borderColor: 'transparent',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}
          >
            {isPresent ? '✓ Presente' : '✗ Ausente'}
          </Button>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      filterable: false,
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => handleOpenEditDialogForRow(params.row)}>
            Editar
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(params.row.id)}>
            Excluir
          </Button>
        </Box>
      )
    }
  ], [handleDelete]);

  // detail panel removed in favor of actions column + edit dialog

  // ensure we don't pass any stray/empty columns (e.g. legacy 'actions') to the grid
  const effectiveColumns = useMemo(() => (
    (columns || []).filter((c: any) => c && typeof c.field === 'string' && c.field.trim() !== '')
  ), [columns]);


  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
          📋 Relatório de Presença - Eventos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </Typography>
      </Paper>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
              {displayedStatistics.totalParticipants}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Participantes
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {displayedStatistics.presentCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Presentes
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {displayedStatistics.absentCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ausentes
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {displayedStatistics.attendanceRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taxa de Presença
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Autocomplete
            freeSolo
            options={events}
            value={selectedEventFilter || ''}
            onChange={(e, newValue) => setSelectedEventFilter((newValue as string) || '')}
            onInputChange={(e, value) => setSelectedEventFilter(value || '')}
            sx={{ minWidth: 240 }}
            renderInput={(params) => (
              <TextField {...params} label="Filtrar por Evento" size="small" />
            )}
          />
          <TextField
            label="Buscar Participante"
            size="small"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Adicionar Participante
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<CloudUpload />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Importar Excel
          </Button>
          <Button 
            variant="outlined" 
            color="success" 
            startIcon={<FileDownload />}
            onClick={exportToExcel}
          >
            Exportar Excel
          </Button>
          {/* Botão de marcar filtrados como presentes removido conforme solicitado */}
          <Button 
            variant="outlined" 
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </Box>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={2}>
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro
            rows={displayedRows}
            columns={effectiveColumns}
            getRowId={(row: any) => row.id}
            initialState={{
              columns: {
                columnVisibilityModel: { __detail_panel_toggle__: false }
              }
            }}
            loading={loading}
            autoPageSize
            disableRowSelectionOnClick={true}
            sx={{
              '& .report-header': {
                backgroundColor: '#1976d2',
                color: 'white',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                borderRight: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: '#f5f5f5',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#e3f2fd',
              }
            }}
          />
        </div>
      </Paper>

      {/* Dialog para adicionar novo participante */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Adicionar Participante</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mt: 1 }}>
            <TextField
              label="Nome do Participante"
              fullWidth
              value={formData.nome_participante || ''}
              onChange={e => handleFormChange('nome_participante', e.target.value)}
            />
            {/* Autocomplete for event name when adding a participant */}
            <Autocomplete
              freeSolo
              options={events}
              value={formData.nome_evento || ''}
              onChange={(e, newValue) => handleFormChange('nome_evento', (newValue as string) || '')}
              onInputChange={(e, value) => handleFormChange('nome_evento', value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nome do Evento"
                  fullWidth
                />
              )}
            />
            <TextField
              label="Nome da Empresa"
              fullWidth
              value={formData.nome_empresa || ''}
              onChange={e => handleFormChange('nome_empresa', e.target.value)}
            />
            <TextField
              label="Telefone"
              fullWidth
              value={formData.telefone || ''}
              onChange={e => handleFormChange('telefone', e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formData.presenca}
                  onChange={e => handleFormChange('presenca', e.target.checked)}
                />
              }
              label="Presente"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddNew} 
            variant="contained" 
            disabled={loading}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => { setOpenEditDialog(false); setEditRowId(null); setEditData({}); }} maxWidth="md" fullWidth>
        <DialogTitle>Editar Participante</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mt: 1 }}>
            <TextField
              label="Nome do Participante"
              fullWidth
              value={editData.nome_participante || ''}
              onChange={e => handleEditChange('nome_participante', e.target.value)}
            />
            <Autocomplete
              freeSolo
              options={events}
              value={editData.nome_evento || ''}
              onChange={(e, newValue) => handleEditChange('nome_evento', (newValue as string) || '')}
              onInputChange={(e, value) => handleEditChange('nome_evento', value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nome do Evento"
                  fullWidth
                />
              )}
            />
            <TextField
              label="Nome da Empresa"
              fullWidth
              value={editData.nome_empresa || ''}
              onChange={e => handleEditChange('nome_empresa', e.target.value)}
            />
            <TextField
              label="Telefone"
              fullWidth
              value={editData.telefone || ''}
              onChange={e => handleEditChange('telefone', e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!editData.presenca}
                  onChange={e => handleEditChange('presenca', e.target.checked)}
                />
              }
              label="Presente"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEditDialog(false); setEditRowId(null); setEditData({}); }}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={loading}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>📤 Importar Lista de Participantes</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Faça upload de um arquivo Excel (.xlsx) com o seguinte formato:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 3 }}>
              <Typography variant="body2" fontFamily="monospace">
                <strong>Cabeçalho:</strong> Nome Completo | Empresa/Instituição | Telefone<br/>
                <strong>Exemplo:</strong><br/>
                Adilson Martins | Adlux | 15991615085<br/>
                Adriano Cipriano | GDA/Escola Guga | 15997899562
              </Typography>
            </Paper>
          </Box>
          
          <Autocomplete
            freeSolo
            options={events}
            value={uploadEventName || ''}
            onChange={(e, newValue) => setUploadEventName((newValue as string) || '')}
            onInputChange={(e, value) => setUploadEventName(value || '')}
            sx={{ mb: 3 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome do Evento"
                fullWidth
                required
                helperText="Selecione um evento para aplicar a todos os participantes importados"
              />
            )}
          />
          
          <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Selecionar Arquivo Excel
              </Button>
            </label>
            {uploadFile && (
              <Typography variant="body2" color="success.main">
                ✓ Arquivo selecionado: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenUploadDialog(false);
            setUploadFile(null);
            setUploadEventName('');
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={processExcelFile} 
            variant="contained" 
            disabled={loading || !uploadFile || !uploadEventName.trim()}
          >
            Importar Participantes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListaPresenca;