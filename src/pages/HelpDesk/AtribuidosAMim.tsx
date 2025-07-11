import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar
} from '@mui/material';
import { ArrowBack, Assignment, AccessTime, Person, Business, ExpandMore, ExpandLess, Edit, Save, Cancel, FilterList, Sort, Clear, Notes, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, getUsername } from '../../utils/storage';
import axios from 'axios';

interface Chamado {
  id: string;
  Solicitante: string;
  Responsavel: string;
  Setor: string;
  Titulo: string;
  Descricao: string;
  Anotacao: string;
  Kanban: string;
  Data_Conclusao: Date | null;
  Expectativa_Conclusao: Date | null;
  Data: Date;
}

interface EditFormData {
  Kanban: string;
  Data_Conclusao: string;
  Anotacao: string;
}

interface FilterState {
  status: string;
  dateFrom: string;
  dateTo: string;
  searchText: string;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

const AtribuidosAMim = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editFormData, setEditFormData] = useState<EditFormData>({
    Kanban: '',
    Data_Conclusao: '',
    Anotacao: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    dateFrom: '',
    dateTo: '',
    searchText: ''
  });
  const [sortConfig, setSortConfig] = useState<SortState>({
    field: 'Data',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchChamados();
  }, []);

  const fetchChamados = async () => {
    try {
      const token = getAccessToken();
      const username = getUsername();
      
      if (!username) {
        setError('Usuário não encontrado');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-helpdesk/responsavel/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setChamados(response.data);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      setError('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (kanban: string) => {
    switch (kanban) {
      case 'BackLog':
        return 'default';
      case 'Aguardando Requisitos':
        return 'warning';
      case 'Em Progresso':
        return 'info';
      case 'Concluído':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const toggleExpanded = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleEditClick = (chamado: Chamado) => {
    setSelectedChamado(chamado);
    setEditFormData({
      Kanban: chamado.Kanban,
      Data_Conclusao: chamado.Data_Conclusao ? new Date(chamado.Data_Conclusao).toISOString().split('T')[0] : '',
      Anotacao: chamado.Anotacao || ''
    });
    setDetailOpen(true);
    setEditMode(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      searchText: ''
    });
  };

  const filteredAndSortedChamados = React.useMemo(() => {
    let filtered = chamados.filter(chamado => {
      // Status filter
      if (filters.status && chamado.Kanban !== filters.status) return false;
      
      // Date range filter
      if (filters.dateFrom) {
        const chamadoDate = new Date(chamado.Data);
        const filterDate = new Date(filters.dateFrom);
        if (chamadoDate < filterDate) return false;
      }
      
      if (filters.dateTo) {
        const chamadoDate = new Date(chamado.Data);
        const filterDate = new Date(filters.dateTo);
        if (chamadoDate > filterDate) return false;
      }
      
      // Text search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return (
          chamado.Titulo.toLowerCase().includes(searchLower) ||
          chamado.Descricao.toLowerCase().includes(searchLower) ||
          chamado.Solicitante.toLowerCase().includes(searchLower) ||
          chamado.Setor.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof Chamado];
      let bValue: any = b[sortConfig.field as keyof Chamado];
      
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [chamados, filters, sortConfig]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/home')} startIcon={<ArrowBack />}>
          Voltar ao Dashboard
        </Button>
      </Container>
    );
  }

  const handleRowClick = (chamado: Chamado) => {
    setSelectedChamado(chamado);
    setEditFormData({
      Kanban: chamado.Kanban,
      Data_Conclusao: chamado.Data_Conclusao ? new Date(chamado.Data_Conclusao).toISOString().split('T')[0] : '',
      Anotacao: chamado.Anotacao || ''
    });
    setDetailOpen(true);
    setEditMode(false);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedChamado(null);
    setEditMode(false);
  };

  const handleEditToggle = () => {
    if (selectedChamado) {
      setEditFormData({
        Kanban: selectedChamado.Kanban,
        Data_Conclusao: selectedChamado.Data_Conclusao ? new Date(selectedChamado.Data_Conclusao).toISOString().split('T')[0] : '',
        Anotacao: selectedChamado.Anotacao || ''
      });
    }
    setEditMode(!editMode);
  };

  const handleEditSubmit = async () => {
    if (!selectedChamado) return;

    setUpdateLoading(true);
    try {
      const token = getAccessToken();
      const updateData = {
        Kanban: editFormData.Kanban,
        Data_Conclusao: editFormData.Data_Conclusao ? new Date(editFormData.Data_Conclusao).toISOString() : null,
        Anotacao: editFormData.Anotacao
      };

      await axios.patch(`${process.env.REACT_APP_API_URL}/tab-helpdesk/${selectedChamado.id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Chamado atualizado com sucesso!',
        severity: 'success'
      });

      // Update the selected chamado with new data - fix type issue
      const updatedChamado: Chamado = { 
        ...selectedChamado, 
        Kanban: updateData.Kanban,
        Data_Conclusao: updateData.Data_Conclusao ? new Date(updateData.Data_Conclusao) : null,
        Anotacao: updateData.Anotacao
      };
      setSelectedChamado(updatedChamado);
      setEditMode(false);
      fetchChamados(); // Refresh data

    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar chamado. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/home')}
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333', flex: 1 }}>
            <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
            Chamados Atribuídos
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterList />}
            sx={{ mr: 1 }}
          >
            Filtros
          </Button>
        </Box>

        {/* Filters Panel */}
        {showFilters && (
          <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Filtros e Ordenação
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Buscar"
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                placeholder="Título, descrição, solicitante..."
              />
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="BackLog">BackLog</MenuItem>
                  <MenuItem value="Aguardando Requisitos">Aguardando Requisitos</MenuItem>
                  <MenuItem value="Em Progresso">Em Progresso</MenuItem>
                  <MenuItem value="Concluído">Concluído</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortConfig.field}
                  label="Ordenar por"
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <MenuItem value="Data">Data Criação</MenuItem>
                  <MenuItem value="Titulo">Título</MenuItem>
                  <MenuItem value="Solicitante">Solicitante</MenuItem>
                  <MenuItem value="Kanban">Status</MenuItem>
                  <MenuItem value="Expectativa_Conclusao">Expectativa</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Data de"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Data até"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Clear />}
                sx={{ minWidth: 120 }}
              >
                Limpar
              </Button>
            </Box>
          </Paper>
        )}

        {/* Results Counter */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredAndSortedChamados.length} de {chamados.length} chamados
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sort fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {sortConfig.field === 'Data' ? 'Data Criação' : 
               sortConfig.field === 'Titulo' ? 'Título' :
               sortConfig.field === 'Solicitante' ? 'Solicitante' :
               sortConfig.field === 'Kanban' ? 'Status' : 'Expectativa'} 
              ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})
            </Typography>
          </Box>
        </Box>

        {filteredAndSortedChamados.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {chamados.length === 0 ? 'Nenhum chamado encontrado' : 'Nenhum chamado corresponde aos filtros'}
            </Typography>
          </Box>
        ) : (
          <>
            {isMobile ? (
              // Mobile Card Layout
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredAndSortedChamados.map((chamado) => (
                  <Card key={chamado.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            '&:hover': { color: '#1976d2' }
                          }}
                          onClick={() => handleRowClick(chamado)}
                        >
                          {chamado.Titulo}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={chamado.Kanban} 
                            color={getStatusColor(chamado.Kanban)}
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(chamado);
                            }}
                            sx={{ color: '#1976d2' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          Solicitante: {chamado.Solicitante}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Business sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          Setor: {chamado.Setor}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTime sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          Criado: {formatDate(chamado.Data)}
                        </Typography>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          cursor: 'pointer', 
                          p: 1, 
                          borderRadius: 1,
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onClick={() => toggleExpanded(chamado.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ mb: 2, flex: 1 }}>
                            {expandedRows.has(chamado.id) ? chamado.Descricao : truncateText(chamado.Descricao)}
                          </Typography>
                          {chamado.Descricao.length > 50 && (
                            expandedRows.has(chamado.id) ? <ExpandLess /> : <ExpandMore />
                          )}
                        </Box>
                      </Box>
                      
                      {chamado.Expectativa_Conclusao && (
                        <Typography variant="body2" color="text.secondary">
                          Expectativa: {formatDate(chamado.Expectativa_Conclusao)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop Table Layout
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSortChange('Titulo')}>
                        Título {sortConfig.field === 'Titulo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSortChange('Solicitante')}>
                        Solicitante {sortConfig.field === 'Solicitante' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSortChange('Setor')}>
                        Setor {sortConfig.field === 'Setor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSortChange('Kanban')}>
                        Status {sortConfig.field === 'Kanban' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSortChange('Data')}>
                        Data Criação {sortConfig.field === 'Data' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSortChange('Expectativa_Conclusao')}>
                        Expectativa {sortConfig.field === 'Expectativa_Conclusao' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Conclusão</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedChamados.map((chamado) => (
                      <TableRow 
                        key={chamado.id} 
                        hover 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onClick={() => handleRowClick(chamado)}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {chamado.Titulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {truncateText(chamado.Descricao)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{chamado.Solicitante}</TableCell>
                        <TableCell>{chamado.Setor}</TableCell>
                        <TableCell>
                          <Chip 
                            label={chamado.Kanban} 
                            color={getStatusColor(chamado.Kanban)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(chamado.Data)}</TableCell>
                        <TableCell>{formatDate(chamado.Expectativa_Conclusao)}</TableCell>
                        <TableCell>{formatDate(chamado.Data_Conclusao)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(chamado);
                            }}
                            sx={{ color: '#1976d2' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment />
              {editMode ? 'Editar Chamado' : 'Detalhes do Chamado'}
            </Box>
            <Button
              onClick={handleEditToggle}
              startIcon={editMode ? <Cancel /> : <Edit />}
              variant={editMode ? 'outlined' : 'contained'}
              disabled={updateLoading}
            >
              {editMode ? 'Cancelar' : 'Editar'}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedChamado && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              {/* Header Info */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {selectedChamado.Titulo}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <Person sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      Solicitante: {selectedChamado.Solicitante}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <Business sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      Setor: {selectedChamado.Setor}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <AccessTime sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      Criado em: {formatDate(selectedChamado.Data)}
                    </Typography>
                  </Box>
                  <Box>
                    {editMode ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editFormData.Kanban}
                          label="Status"
                          onChange={(e) => handleEditFormChange('Kanban', e.target.value)}
                        >
                          <MenuItem value="BackLog">BackLog</MenuItem>
                          <MenuItem value="Aguardando Requisitos">Aguardando Requisitos</MenuItem>
                          <MenuItem value="Em Progresso">Em Progresso</MenuItem>
                          <MenuItem value="Concluído">Concluído</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip 
                        label={selectedChamado.Kanban} 
                        color={getStatusColor(selectedChamado.Kanban)}
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description />
                  Descrição
                </Typography>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedChamado.Descricao}
                  </Typography>
                </Paper>
              </Box>

              {/* Annotations */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Notes />
                  Minhas Anotações
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editFormData.Anotacao}
                    onChange={(e) => handleEditFormChange('Anotacao', e.target.value)}
                    placeholder="Adicione suas anotações aqui..."
                    variant="outlined"
                  />
                ) : (
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    {selectedChamado.Anotacao ? (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {selectedChamado.Anotacao}
                      </Typography>
                    ) : (
                      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Nenhuma anotação disponível
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>

              {/* Dates */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Datas
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Expectativa de Conclusão:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatDate(selectedChamado.Expectativa_Conclusao)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Data de Conclusão:
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        type="date"
                        value={editFormData.Data_Conclusao}
                        onChange={(e) => handleEditFormChange('Data_Conclusao', e.target.value)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formatDate(selectedChamado.Data_Conclusao)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>
            Fechar
          </Button>
          {editMode && (
            <Button 
              onClick={handleEditSubmit} 
              variant="contained" 
              startIcon={<Save />}
              disabled={updateLoading}
            >
              {updateLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AtribuidosAMim;