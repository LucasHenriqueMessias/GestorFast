import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  TextField,
  MenuItem,
  Paper,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { getAccessToken, getDepartment } from '../../utils/storage';

interface EntregaData {
  id?: number;
  razao_social: string;
  analista: string;
  consultor: string;
  data: string;
  categoria: string;
  tipo_impacto: string;
  impacto_mensal_r: number;
  impacto_anual_r: number;
  impacto_percentual: number;
  complexidade: string;
  horas_gastas: number;
  descricao_tecnica: {
    situacao_encontrada: string;
    problema_identificado: string;
    acao_recomendada: string;
    resultado_esperado: string;
  };
  status: string;
}

interface ListaEntregasProps {
  entregas: EntregaData[];
  loading: boolean;
  onRefresh?: () => void;
}

const categorias = [
  'Redução de custo',
  'Análise de fluxo de caixa',
  'Diagnóstico financeiro',
  'Planejamento tributário',
  'Estruturação de DRE',
  'Projeção financeira',
  'Recuperação de margem',
  'Renegociação de contrato',
  'Auditoria interna',
  'Ajuste contábil'
];

const statusOptions = [
  'Em análise',
  'Entregue ao consultor',
  'Apresentado ao cliente',
  'Implementado',
  'Rejeitado'
];

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Em análise': return 'info';
    case 'Entregue ao consultor': return 'primary';
    case 'Apresentado ao cliente': return 'warning';
    case 'Implementado': return 'success';
    case 'Rejeitado': return 'error';
    default: return 'default';
  }
};

const getTipoImpactoIcon = (tipo: string): string => {
  switch (tipo) {
    case 'Economia': return '💰';
    case 'Aumento de receita': return '📈';
    case 'Mitigação de risco': return '⚠️';
    case 'Organização/Controle': return '📊';
    case 'Diagnóstico': return '🔎';
    default: return '📌';
  }
};

const ListaEntregas: React.FC<ListaEntregasProps> = ({ entregas, loading, onRefresh }) => {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroAnalista, setFiltroAnalista] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [impactoMinimo, setImpactoMinimo] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState<EntregaData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entregaToDelete, setEntregaToDelete] = useState<EntregaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const department = getDepartment();
  const canEdit = ['Analista', 'Developer', 'Diretor'].includes(department || '');

  const clientesUnicos = useMemo(
    () => Array.from(new Set(entregas.map((e) => e.razao_social))),
    [entregas]
  );

  const analistasUnicos = useMemo(
    () => Array.from(new Set(entregas.map((e) => e.analista))),
    [entregas]
  );

  const entregasFiltradas = useMemo(() => {
    return entregas.filter((entrega) => {
      const matchCliente = !filtroCliente || entrega.razao_social === filtroCliente;
      const matchAnalista = !filtroAnalista || entrega.analista === filtroAnalista;
      const matchCategoria = !filtroCategoria || entrega.categoria === filtroCategoria;
      const matchStatus = !filtroStatus || entrega.status === filtroStatus;
      const matchImpacto = !impactoMinimo || entrega.impacto_anual_r >= Number(impactoMinimo);

      return matchCliente && matchAnalista && matchCategoria && matchStatus && matchImpacto;
    });
  }, [entregas, filtroCliente, filtroAnalista, filtroCategoria, filtroStatus, impactoMinimo]);

  const totalValorGerado = useMemo(
    () => entregasFiltradas.reduce((sum, e) => sum + Number(e.impacto_anual_r), 0),
    [entregasFiltradas]
  );

  const handleOpenDetails = (entrega: EntregaData) => {
    setSelectedEntrega(entrega);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEntrega(null);
  };

  const handleEditClick = (entrega: EntregaData) => {
    setEditingEntrega({ ...entrega });
    setEditOpen(true);
    setDetailsOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editingEntrega || !editingEntrega.id) return;

    try {
      const token = getAccessToken();
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/insights-analista/${editingEntrega.id}`,
        editingEntrega,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Entrega atualizada com sucesso!');
      setEditOpen(false);
      setEditingEntrega(null);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao atualizar entrega');
      console.error(err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteClick = (entrega: EntregaData) => {
    setEntregaToDelete(entrega);
    setDeleteConfirmOpen(true);
    setDetailsOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!entregaToDelete || !entregaToDelete.id) return;

    try {
      const token = getAccessToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/insights-analista/${entregaToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Entrega deletada com sucesso!');
      setDeleteConfirmOpen(false);
      setEntregaToDelete(null);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erro ao deletar entrega');
      console.error(err);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <Box sx={{ pl: { xs: 2, sm: 3 } }}>
      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3, backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: 1 }}>
          🔍 Filtros Avançados
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="Cliente"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          >
            <MenuItem value="">Todos</MenuItem>
            {clientesUnicos.map((cliente) => (
              <MenuItem key={cliente} value={cliente}>
                {cliente}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Analista"
            value={filtroAnalista}
            onChange={(e) => setFiltroAnalista(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          >
            <MenuItem value="">Todos</MenuItem>
            {analistasUnicos.map((analista) => (
              <MenuItem key={analista} value={analista}>
                {analista}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          >
            <MenuItem value="">Todos</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          >
            <MenuItem value="">Todos</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Impacto Mínimo (R$)"
            type="number"
            value={impactoMinimo}
            onChange={(e) => setImpactoMinimo(e.target.value)}
            fullWidth
            size="small"
            placeholder="0"
            variant="outlined"
          />
        </Box>
      </Card>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Total de Entregas
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {entregasFiltradas.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            💰 Valor Total Anual (R$)
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(totalValorGerado))}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            📊 Avg Impacto/Entrega
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {entregasFiltradas.length > 0
              ? (totalValorGerado / entregasFiltradas.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : 'R$ 0,00'}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            ✅ Taxa Implementação
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {entregasFiltradas.length > 0
              ? `${((entregasFiltradas.filter((e) => e.status === 'Implementado').length / entregasFiltradas.length) * 100).toFixed(1)}%`
              : '0%'}
          </Typography>
        </Paper>
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#3B82F6' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Categoria</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Impacto Anual</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Complexidade</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entregasFiltradas.length > 0 ? (
              entregasFiltradas.map((entrega, idx) => (
                <TableRow
                  key={entrega.id || idx}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? '#F8FAFC' : 'white',
                    '&:hover': { backgroundColor: '#E0F2FE' },
                  }}
                >
                  <TableCell>{entrega.razao_social}</TableCell>
                  <TableCell>{entrega.categoria}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {entrega.impacto_anual_r.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>{entrega.complexidade}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={entrega.status}
                      color={getStatusColor(entrega.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDetails(entrega)}
                      sx={{ color: '#3B82F6' }}
                      title="Ver detalhes"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {canEdit && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(entrega)}
                          sx={{ color: '#3B82F6' }}
                          title="Editar entrega"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(entrega)}
                          sx={{ color: '#3B82F6' }}
                          title="Deletar entrega"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">Nenhuma entrega encontrada</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Detalhes */}
      {selectedEntrega && (
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#1E3A8A', color: 'white', fontWeight: 'bold' }}>
            {getTipoImpactoIcon(selectedEntrega.tipo_impacto)} Detalhes da Entrega
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                <strong>Cliente:</strong> {selectedEntrega.razao_social}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                <strong>Analista:</strong> {selectedEntrega.analista}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                <strong>Consultor:</strong> {selectedEntrega.consultor}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                <strong>Data:</strong> {new Date(selectedEntrega.data).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>

            {selectedEntrega.descricao_tecnica && (
              <>
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                    📋 Situação Encontrada
                  </Typography>
                  <Typography variant="body2">{selectedEntrega.descricao_tecnica.situacao_encontrada}</Typography>
                </Box>

                <Box sx={{ mb: 2, p: 2, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                    ⚠️ Problema Identificado
                  </Typography>
                  <Typography variant="body2">{selectedEntrega.descricao_tecnica.problema_identificado}</Typography>
                </Box>

                <Box sx={{ mb: 2, p: 2, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                    ✅ Ação Recomendada
                  </Typography>
                  <Typography variant="body2">{selectedEntrega.descricao_tecnica.acao_recomendada}</Typography>
                </Box>

                <Box sx={{ mb: 2, p: 2, backgroundColor: '#EFF6FF', borderRadius: 1, borderLeft: '4px solid #3B82F6' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3B82F6', mb: 1 }}>
                    🎯 Resultado Esperado
                  </Typography>
                  <Typography variant="body2">{selectedEntrega.descricao_tecnica.resultado_esperado}</Typography>
                </Box>
              </>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  <strong>Impacto Mensal:</strong>
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#3B82F6' }}>
                  {selectedEntrega.impacto_mensal_r.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  <strong>Impacto Anual:</strong>
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#3B82F6' }}>
                  {selectedEntrega.impacto_anual_r.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  <strong>Impacto %:</strong>
                </Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {selectedEntrega.impacto_percentual}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  <strong>Horas Gastas:</strong>
                </Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {selectedEntrega.horas_gastas}h
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {canEdit && selectedEntrega?.id && (
              <Box sx={{ mr: 'auto' }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleEditClick(selectedEntrega)}
                  sx={{ color: '#3B82F6' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteClick(selectedEntrega)}
                  sx={{ color: '#3B82F6' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            <Button onClick={handleCloseDetails} variant="contained">
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog Editar Entrega */}
      {editingEntrega && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#3B82F6', color: 'white', fontWeight: 'bold' }}>
            ✏️ Editar Entrega
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <TextField
              select
              label="Status"
              value={editingEntrega.status}
              onChange={(e) => setEditingEntrega({ ...editingEntrega, status: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              required
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Impacto Mensal (R$)"
              type="number"
              value={editingEntrega.impacto_mensal_r}
              onChange={(e) => setEditingEntrega({ ...editingEntrega, impacto_mensal_r: Number(e.target.value) })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Impacto Anual (R$)"
              type="number"
              value={editingEntrega.impacto_anual_r}
              onChange={(e) => setEditingEntrega({ ...editingEntrega, impacto_anual_r: Number(e.target.value) })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Impacto Percentual (%)"
              type="number"
              value={editingEntrega.impacto_percentual}
              onChange={(e) => setEditingEntrega({ ...editingEntrega, impacto_percentual: Number(e.target.value) })}
              fullWidth
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} variant="contained" sx={{ backgroundColor: '#3B82F6' }}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog Confirmar Exclusão */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#3B82F6', color: 'white', fontWeight: 'bold' }}>
          ⚠️ Confirmar Exclusão
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Tem certeza que deseja deletar a entrega de <strong>{entregaToDelete?.razao_social}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: '#6B7280' }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" sx={{ backgroundColor: '#3B82F6' }}>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaEntregas;
