import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  TextField,
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
  Autocomplete,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { getAccessToken, getDepartment } from '../../utils/storage';
import NovaEntrega from './NovaEntrega';

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
  origem_demanda: string;
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
  'Ajuste contábil',
  'Análise DRE mensal/trimestral/anual',
  'Análise Orçado x Realizado',
  'Migração de extratos do cliente para Fluxo Fast',
  'Tarefas internas extras',
  'Treinamento de ferramentas extras',
  'Treinamento de integração de novos colaboradores',
  'Reunião Analista x Cliente',
  'Conferência de conciliação Bancária',
  'Análise de DRE Competência x Caixa (e outros)'
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
  const normalizedTipo = tipo.replace(/^[💰📈⚠️📊🔎]\s*/, '');

  switch (normalizedTipo) {
    case 'Economia': return '💰';
    case 'Aumento de receita': return '📈';
    case 'Mitigação de risco': return '⚠️';
    case 'Organização/Controle': return '📊';
    case 'Diagnóstico': return '🔎';
    default: return '📌';
  }
};

const getTipoImpactoLabel = (tipo: string): string => tipo.replace(/^[💰📈⚠️📊🔎]\s*/, '');

const ListaEntregas: React.FC<ListaEntregasProps> = ({ entregas, loading, onRefresh }) => {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroAnalista, setFiltroAnalista] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [impactoMinimo, setImpactoMinimo] = useState('');
  const [inputClienteValue, setInputClienteValue] = useState('');
  const [inputAnalistaValue, setInputAnalistaValue] = useState('');
  const [inputCategoriaValue, setInputCategoriaValue] = useState('');
  const [inputStatusValue, setInputStatusValue] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState<EntregaData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entregaToDelete, setEntregaToDelete] = useState<EntregaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const department = getDepartment();
  const canEdit = ['Analista', 'Developer', 'Diretor', 'Gestor'].includes(department || '') && department !== 'Financeiro';

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

  const handleSaveEdit = async (formData: any) => {
    if (!editingEntrega || !editingEntrega.id) return;

    try {
      const token = getAccessToken();
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/insights-analista/${editingEntrega.id}`,
        formData,
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
          <Autocomplete
            options={clientesUnicos}
            value={filtroCliente}
            onChange={(event, value) => setFiltroCliente(value || '')}
            inputValue={inputClienteValue}
            onInputChange={(event, value) => setInputClienteValue(value)}
            renderInput={(params) => <TextField {...params} label="Cliente" size="small" />}
            clearOnBlur
            noOptionsText="Nenhum cliente encontrado"
            size="small"
          />
          <Autocomplete
            options={analistasUnicos}
            value={filtroAnalista}
            onChange={(event, value) => setFiltroAnalista(value || '')}
            inputValue={inputAnalistaValue}
            onInputChange={(event, value) => setInputAnalistaValue(value)}
            renderInput={(params) => <TextField {...params} label="Analista" size="small" />}
            clearOnBlur
            noOptionsText="Nenhum analista encontrado"
            size="small"
          />
          <Autocomplete
            options={categorias}
            value={filtroCategoria}
            onChange={(event, value) => setFiltroCategoria(value || '')}
            inputValue={inputCategoriaValue}
            onInputChange={(event, value) => setInputCategoriaValue(value)}
            renderInput={(params) => <TextField {...params} label="Categoria" size="small" />}
            clearOnBlur
            noOptionsText="Nenhuma categoria encontrada"
            size="small"
          />
          <Autocomplete
            options={statusOptions}
            value={filtroStatus}
            onChange={(event, value) => setFiltroStatus(value || '')}
            inputValue={inputStatusValue}
            onInputChange={(event, value) => setInputStatusValue(value)}
            renderInput={(params) => <TextField {...params} label="Status" size="small" />}
            clearOnBlur
            noOptionsText="Nenhum status encontrado"
            size="small"
          />
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
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#1E3A8A', color: 'white', fontWeight: 'bold' }}>
            {getTipoImpactoIcon(selectedEntrega.tipo_impacto)} Detalhes da Entrega
          </DialogTitle>
          <DialogContent sx={{ mt: 2, maxHeight: '72vh', overflowY: 'auto' }}>
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip size="small" label={selectedEntrega.status} color={getStatusColor(selectedEntrega.status)} variant="outlined" />
                <Chip size="small" label={getTipoImpactoLabel(selectedEntrega.tipo_impacto)} color="primary" variant="outlined" />
                <Chip size="small" label={selectedEntrega.complexidade} color="secondary" variant="outlined" />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 0.5 }}>
                {selectedEntrega.razao_social}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {selectedEntrega.categoria}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <Box sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <Typography variant="overline" sx={{ color: '#6B7280' }}>Identificação</Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}><strong>Cliente:</strong> {selectedEntrega.razao_social}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Analista:</strong> {selectedEntrega.analista}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Consultor:</strong> {selectedEntrega.consultor}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Data:</strong> {new Date(selectedEntrega.data).toLocaleDateString('pt-BR')}</Typography>
                <Typography variant="body2"><strong>Origem:</strong> {selectedEntrega.origem_demanda}</Typography>
              </Box>

              <Box sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                <Typography variant="overline" sx={{ color: '#6B7280' }}>Impacto e Esforço</Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}><strong>Impacto Mensal:</strong> {selectedEntrega.impacto_mensal_r.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Impacto Anual:</strong> {selectedEntrega.impacto_anual_r.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Impacto %:</strong> {selectedEntrega.impacto_percentual}%</Typography>
                <Typography variant="body2"><strong>Horas Gastas:</strong> {selectedEntrega.horas_gastas}h</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2, p: 2, backgroundColor: '#EFF6FF', borderRadius: 2, borderLeft: '4px solid #3B82F6' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                📋 Descrição Técnica
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Situação Encontrada:</strong> {selectedEntrega.descricao_tecnica?.situacao_encontrada || 'Não informada'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Problema Identificado:</strong> {selectedEntrega.descricao_tecnica?.problema_identificado || 'Não informado'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Ação Recomendada:</strong> {selectedEntrega.descricao_tecnica?.acao_recomendada || 'Não informada'}
              </Typography>
              <Typography variant="body2">
                <strong>Resultado Esperado:</strong> {selectedEntrega.descricao_tecnica?.resultado_esperado || 'Não informado'}
              </Typography>
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
        <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditingEntrega(null); }} maxWidth="md" fullWidth>
          <NovaEntrega
            onClose={() => { setEditOpen(false); setEditingEntrega(null); }}
            onSubmit={handleSaveEdit}
            analista={editingEntrega.analista}
            initialValues={editingEntrega}
            title="✏️ Editar Entrega"
            submitLabel="Salvar Alterações"
          />
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
