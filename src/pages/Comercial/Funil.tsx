import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  useDraggable,
} from '@dnd-kit/core';
import { 
  Container, 
  Typography, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card,
  CardContent,
  Box,
  Chip,
  Paper,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const Funil = () => {
  const [prospeccaoData, setProspeccaoData] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Definir as fases do funil na ordem correta
  const fasesFunil = [
    { key: 'Lead', name: 'Lead', color: '#e3f2fd' },
    { key: 'Sem Perfil', name: 'Sem Perfil', color: '#f3e5f5' },
    { key: 'Proposta Enviada', name: 'Proposta Enviada', color: '#fff3e0' },
    { key: 'Em Negociação', name: 'Em Negociação', color: '#e8f5e8' },
    { key: 'Contrato Fechado', name: 'Contrato Fechado', color: '#e1f5fe' },
    { key: 'Não Houve Interesse', name: 'Não Houve Interesse', color: '#ffebee' },
    { key: 'Não é o Momento', name: 'Não é o Momento', color: '#fce4ec' }
  ];

  // Agrupar dados por status
  const groupByStatus = (data: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    fasesFunil.forEach(fase => {
      grouped[fase.key] = data.filter(item => item.status_prospeccao === fase.key);
    });
    return grouped;
  };

  // Função para contar leads por temperatura em uma fase
  const countByTemperatura = (leads: any[]) => {
    const quentes = leads.filter(lead => lead.temperatura === 'Quente').length;
    const frios = leads.filter(lead => lead.temperatura === 'Frio').length;
    const semTemperatura = leads.filter(lead => !lead.temperatura || (lead.temperatura !== 'Quente' && lead.temperatura !== 'Frio')).length;
    
    return { quentes, frios, semTemperatura };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/prospeccao`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProspeccaoData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleEditClick = (row: any) => {
    // Formatar as datas para exibição no formulário (formato YYYY-MM-DD para input date)
    const formattedRow = {
      ...row,
      data_previsao_fechamento: formatDateForInput(row.data_previsao_fechamento),
      data_retorno: formatDateForInput(row.data_retorno)
    };
    setEditRecord(formattedRow);
    setEditOpen(true);
  };

  const handleEditChange = (e: any) => {
    const name = e.target.name;
    let value = e.target.value;
    
    // Converter valores string para boolean para os campos apropriados
    if (name === 'cliente_fast' || name === 'prospeccao') {
      value = value === 'true';
    }
    
    setEditRecord({ ...editRecord, [name]: value });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Usar UTC para evitar problemas de fuso horário
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD para input date
  };

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return null;
    
    // Se está no formato YYYY-MM-DD (input date), converte para UTC ISO
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return date.toISOString();
    }
    
    // Se já está no formato dd/mm/yyyy, converte para UTC ISO
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return date.toISOString();
    }
    
    // Se já está em formato ISO ou outro formato válido
    return new Date(dateString).toISOString();
  };

  const handleEditSave = async () => {
    try {
      const token = getAccessToken();
      
      // Formatar as datas para timestamptz antes de enviar
      const dataToSend = {
        ...editRecord,
        data_previsao_fechamento: formatDateForAPI(editRecord.data_previsao_fechamento),
        data_retorno: formatDateForAPI(editRecord.data_retorno)
      };
      
      await axios.patch(`${process.env.REACT_APP_API_URL}/loja/update/${editRecord.cnpj}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditOpen(false);
      fetchData();
      setSnackbar({ open: true, message: 'Lead atualizado com sucesso!', severity: 'success' });
    } catch (error) {
      console.error('Erro ao editar registro:', error);
      setSnackbar({ open: true, message: 'Erro ao atualizar lead!', severity: 'error' });
    }
  };

  // Função para lidar com o drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Verificar se é um drop sobre uma coluna (status)
    const newStatus = fasesFunil.find(fase => fase.key === overId)?.key;
    
    if (!newStatus) return;

    // Encontrar o lead
    const lead = prospeccaoData.find((item: any) => item.cnpj === activeId) as any;
    
    if (!lead || lead.status_prospeccao === newStatus) return;

    try {
      const token = getAccessToken();
      
      // Atualizar no backend
      await axios.patch(`${process.env.REACT_APP_API_URL}/loja/update/${activeId}`, {
        status_prospeccao: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualizar no frontend
      setProspeccaoData((prevData: any) => 
        prevData.map((item: any) => 
          item.cnpj === activeId 
            ? { ...item, status_prospeccao: newStatus }
            : item
        )
      );

      setSnackbar({ 
        open: true, 
        message: `Lead movido para "${newStatus}" com sucesso!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erro ao mover lead!', 
        severity: 'error' 
      });
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getTemperaturaIcon = (temperatura: string) => {
    return temperatura === 'Quente' ? '🔥' : temperatura === 'Frio' ? '❄️' : '';
  };

  // Função para formatar CNPJ
  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    
    // Remove caracteres não numéricos
    const numericCNPJ = cnpj.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (numericCNPJ.length === 14) {
      return numericCNPJ.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    
    // Se não tiver 14 dígitos, retorna como está
    return cnpj;
  };

  // Componente para o card arrastável
  const DraggableLeadCard = ({ lead, handleEditClick }: { lead: any, handleEditClick: (lead: any) => void }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: lead.cnpj,
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
      <Card
        ref={setNodeRef}
        style={style}
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': !isDragging ? {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          } : {},
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box 
                {...attributes}
                {...listeners}
                sx={{ 
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  display: 'flex',
                  alignItems: 'center',
                  color: '#999',
                  padding: '4px'
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: '16px' }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
                {lead.razao_social}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(lead);
              }}
              sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BusinessIcon sx={{ fontSize: '14px', color: '#666' }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
              {formatCNPJ(lead.cnpj)}
            </Typography>
          </Box>

          {lead.responsavel_prospeccao && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem', bgcolor: '#1976d2' }}>
                {lead.responsavel_prospeccao.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
                {lead.responsavel_prospeccao}
              </Typography>
            </Box>
          )}

          {lead.temperatura && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ThermostatIcon sx={{ fontSize: '14px', color: lead.temperatura === 'Quente' ? '#ff5722' : '#2196f3' }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
                {getTemperaturaIcon(lead.temperatura)} {lead.temperatura}
              </Typography>
            </Box>
          )}

          {lead.data_previsao_fechamento && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: '14px', color: '#666' }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>
                Prev: {formatDateDisplay(lead.data_previsao_fechamento)}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            {lead.cliente_fast && (
              <Chip 
                label="Cliente Fast" 
                size="small" 
                sx={{ 
                  fontSize: '0.65rem', 
                  height: 20,
                  bgcolor: '#4caf50',
                  color: 'white'
                }} 
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Componente para a zona de drop
  const DroppableColumn = ({ children, id, isOver }: { children: React.ReactNode, id: string, isOver: boolean }) => {
    const { setNodeRef } = useDroppable({
      id,
    });

    return (
      <Box
        ref={setNodeRef}
        sx={{ 
          maxHeight: 600, 
          overflowY: 'auto',
          minHeight: 100,
          backgroundColor: isOver ? 'rgba(0,0,0,0.05)' : 'transparent',
          borderRadius: 1,
          transition: 'background-color 0.2s ease',
          border: isOver ? '2px dashed #1976d2' : '2px dashed transparent',
        }}
      >
        {children}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Funil de Clientes
      </Typography>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {fasesFunil.map((fase) => {
            const leadsNaFase = groupByStatus(prospeccaoData)[fase.key] || [];
            const totalValue = leadsNaFase.length;
            const { quentes, frios, semTemperatura } = countByTemperatura(leadsNaFase);
            
            return (
              <Paper
                key={fase.key}
                sx={{
                  minWidth: 300,
                  maxWidth: 300,
                  backgroundColor: fase.color,
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 1,
                  pb: 1,
                  borderBottom: '2px solid rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {fase.name}
                  </Typography>
                  <Chip 
                    label={totalValue} 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      color: '#333',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>

                {/* Contadores de Temperatura */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 2,
                  flexWrap: 'wrap'
                }}>
                  {quentes > 0 && (
                    <Chip
                      icon={<ThermostatIcon sx={{ fontSize: '14px' }} />}
                      label={`🔥 ${quentes}`}
                      size="small"
                      sx={{
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: '#d32f2f'
                        }
                      }}
                    />
                  )}
                  {frios > 0 && (
                    <Chip
                      icon={<ThermostatIcon sx={{ fontSize: '14px' }} />}
                      label={`❄️ ${frios}`}
                      size="small"
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: '#1976d2'
                        }
                      }}
                    />
                  )}
                  {semTemperatura > 0 && (
                    <Chip
                      label={`⚪ ${semTemperatura}`}
                      size="small"
                      sx={{
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  )}
                </Box>
                
                <DroppableColumn id={fase.key} isOver={activeId !== null}>
                  {leadsNaFase.length === 0 ? (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        fontStyle: 'italic',
                        py: 4
                      }}
                    >
                      Nenhum lead nesta fase
                    </Typography>
                  ) : (
                    leadsNaFase.map((lead) => (
                      <DraggableLeadCard 
                        key={lead.cnpj}
                        lead={lead}
                        handleEditClick={handleEditClick}
                      />
                    ))
                  )}
                </DroppableColumn>
              </Paper>
            );
          })}
        </Box>

        <DragOverlay>
          {activeId ? (
            <DraggableLeadCard 
              lead={prospeccaoData.find((item: any) => item.cnpj === activeId)}
              handleEditClick={handleEditClick}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar Registro</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Prospecção</InputLabel>
            <Select
              name="prospeccao"
              value={editRecord?.prospeccao?.toString() ?? ''}
              onChange={handleEditChange}
              label="Prospecção"
            >
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="responsavel_prospeccao"
            label="Responsável"
            fullWidth
            value={editRecord?.responsavel_prospeccao || ''}
            onChange={handleEditChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Temperatura</InputLabel>
            <Select
              name="temperatura"
              value={editRecord?.temperatura || ''}
              onChange={handleEditChange}
              label="Temperatura"
            >
              <MenuItem value="">Selecione...</MenuItem>
              <MenuItem value="Quente">Quente</MenuItem>
              <MenuItem value="Frio">Frio</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="data_previsao_fechamento"
            label="Previsão Fechamento"
            type="date"
            fullWidth
            value={editRecord?.data_previsao_fechamento || ''}
            onChange={handleEditChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="data_retorno"
            label="Data Retorno"
            type="date"
            fullWidth
            value={editRecord?.data_retorno || ''}
            onChange={handleEditChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status_prospeccao"
              value={editRecord?.status_prospeccao || ''}
              onChange={handleEditChange}
              label="Status"
            >
              <MenuItem value="">Selecione...</MenuItem>
              <MenuItem value="Sem Perfil">Sem Perfil</MenuItem>
              <MenuItem value="Proposta Enviada">Proposta Enviada</MenuItem>
              <MenuItem value="Em Negociação">Em Negociação</MenuItem>
              <MenuItem value="Contrato Fechado">Contrato Fechado</MenuItem>
              <MenuItem value="Não Houve Interesse">Não Houve Interesse</MenuItem>
              <MenuItem value="Não é o Momento">Não é o Momento</MenuItem>
              <MenuItem value="Lead">Lead</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente Fast</InputLabel>
            <Select
              name="cliente_fast"
              value={editRecord?.cliente_fast?.toString() ?? ''}
              onChange={handleEditChange}
              label="Cliente Fast"
            >
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="primary">Cancelar</Button>
          <Button onClick={handleEditSave} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default Funil;