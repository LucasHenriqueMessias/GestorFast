import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Typography,
  Autocomplete,
} from '@mui/material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

interface NovaEntregaProps {
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  analista: string;
}

interface EntregaForm {
  razao_social: string;
  analista: string;
  consultor: string;
  data: string;
  categoria: string;
  tipo_impacto: string;
  impacto_mensal_r: number | string;
  impacto_anual_r: number | string;
  impacto_percentual: number | string;
  complexidade: string;
  horas_gastas: number | string;
  descricao_tecnica: {
    situacao_encontrada: string;
    problema_identificado: string;
    acao_recomendada: string;
    resultado_esperado: string;
  };
  status: string;
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

const tiposImpacto = [
  '💰 Economia',
  '📈 Aumento de receita',
  '⚠️ Mitigação de risco',
  '📊 Organização/Controle',
  '🔎 Diagnóstico'
];

const statusOptions = [
  'Em análise',
  'Entregue ao consultor',
  'Apresentado ao cliente',
  'Implementado',
  'Rejeitado'
];

const NovaEntrega: React.FC<NovaEntregaProps> = ({ onClose, onSubmit, analista }) => {
  const [clientes, setClientes] = useState<string[]>([]);
  const [consultores, setConsultores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EntregaForm>({
    razao_social: '',
    analista: analista,
    consultor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    tipo_impacto: '',
    impacto_mensal_r: '',
    impacto_anual_r: '',
    impacto_percentual: '',
    complexidade: '',
    horas_gastas: '',
    descricao_tecnica: {
      situacao_encontrada: '',
      problema_identificado: '',
      acao_recomendada: '',
      resultado_esperado: ''
    },
    status: 'Em análise'
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = getAccessToken();

        // Buscar clientes
        const clientesRes = await axios.get(`${process.env.REACT_APP_API_URL}/loja/razaosocial`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const razoesSociais = clientesRes.data.map((item: { razao_social: string }) => item.razao_social);
        setClientes(razoesSociais);

        // Buscar consultores (você pode ajustar endpoint)
        try {
          const consultoresRes = await axios.get(`${process.env.REACT_APP_API_URL}/loja/consultores`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const nomes = consultoresRes.data.map((item: any) => item.nome || item.username);
          setConsultores(nomes);
        } catch (err) {
          // Se endpoint não existir, deixa vazio
          setConsultores([]);
        }
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Para campos aninhados como descricao_tecnica.situacao_encontrada
      const [section, subfield] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev as any)[section],
          [subfield]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        impacto_mensal_r: Number(formData.impacto_mensal_r),
        impacto_anual_r: Number(formData.impacto_anual_r),
        impacto_percentual: Number(formData.impacto_percentual),
        horas_gastas: Number(formData.horas_gastas),
        tipo_impacto: formData.tipo_impacto.replace(/^[💰📈⚠️📊🔎]\s/, '')
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle sx={{ backgroundColor: '#1E3A8A', color: 'white', fontWeight: 'bold' }}>
        ➕ Nova Entrega de Análise
      </DialogTitle>
      <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Seção 1: Identificação */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            🔹 Identificação
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
              <Autocomplete
                options={clientes}
                value={formData.razao_social}
                onChange={(e, v) => handleInputChange('razao_social', v || '')}
                renderInput={(params) => <TextField {...params} label="Cliente *" required fullWidth />}
                freeSolo
              />
            </Box>
            <TextField
              label="Analista *"
              value={formData.analista}
              disabled
              fullWidth
            />
            <Autocomplete
              options={consultores}
              value={formData.consultor}
              onChange={(e, v) => handleInputChange('consultor', v || '')}
              renderInput={(params) => <TextField {...params} label="Consultor *" required fullWidth />}
              freeSolo
            />
            <TextField
              label="Data *"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </Box>

        {/* Seção 2: Categoria */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            🔹 Categoria do Serviço
          </Typography>
          <TextField
            select
            label="Categoria *"
            value={formData.categoria}
            onChange={(e) => handleInputChange('categoria', e.target.value)}
            fullWidth
            required
          >
            {categorias.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Seção 3: Tipo de Impacto */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            🔹 Tipo de Impacto
          </Typography>
          <TextField
            select
            label="Tipo de Impacto *"
            value={formData.tipo_impacto}
            onChange={(e) => handleInputChange('tipo_impacto', e.target.value)}
            fullWidth
            required
          >
            {tiposImpacto.map(tipo => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Seção 4: Impacto */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            💰 Impacto Estimado
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Impacto Mensal (R$) *"
              type="number"
              value={formData.impacto_mensal_r}
              onChange={(e) => handleInputChange('impacto_mensal_r', e.target.value)}
              fullWidth
              required
              inputProps={{ step: '0.01' }}
            />
            <TextField
              label="Impacto Anual (R$) *"
              type="number"
              value={formData.impacto_anual_r}
              onChange={(e) => handleInputChange('impacto_anual_r', e.target.value)}
              fullWidth
              required
              inputProps={{ step: '0.01' }}
            />
            <TextField
              label="Impacto Percentual (%) *"
              type="number"
              value={formData.impacto_percentual}
              onChange={(e) => handleInputChange('impacto_percentual', e.target.value)}
              fullWidth
              required
              inputProps={{ step: '0.1' }}
            />
          </Box>
        </Box>

        {/* Seção 5: Complexidade e Tempo */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            🔹 Complexidade e Tempo
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Complexidade *"
              value={formData.complexidade}
              onChange={(e) => handleInputChange('complexidade', e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="Baixa">Baixa</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
            </TextField>
            <TextField
              label="Horas Gastas *"
              type="number"
              value={formData.horas_gastas}
              onChange={(e) => handleInputChange('horas_gastas', e.target.value)}
              fullWidth
              required
              inputProps={{ step: '0.5' }}
            />
          </Box>
        </Box>

        {/* Seção 6: Descrição Técnica */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            📋 Descrição Técnica
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            <TextField
              label="Situação Encontrada *"
              value={formData.descricao_tecnica.situacao_encontrada}
              onChange={(e) => handleInputChange('descricao_tecnica.situacao_encontrada', e.target.value)}
              fullWidth
              multiline
              rows={2}
              required
            />
            <TextField
              label="Problema Identificado *"
              value={formData.descricao_tecnica.problema_identificado}
              onChange={(e) => handleInputChange('descricao_tecnica.problema_identificado', e.target.value)}
              fullWidth
              multiline
              rows={2}
              required
            />
            <TextField
              label="Ação Recomendada *"
              value={formData.descricao_tecnica.acao_recomendada}
              onChange={(e) => handleInputChange('descricao_tecnica.acao_recomendada', e.target.value)}
              fullWidth
              multiline
              rows={2}
              required
            />
            <TextField
              label="Resultado Esperado *"
              value={formData.descricao_tecnica.resultado_esperado}
              onChange={(e) => handleInputChange('descricao_tecnica.resultado_esperado', e.target.value)}
              fullWidth
              multiline
              rows={2}
              required
            />
          </Box>
        </Box>

        {/* Seção 7: Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            🔹 Status
          </Typography>
          <TextField
            select
            label="Status *"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            fullWidth
            required
          >
            {statusOptions.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Entrega'}
        </Button>
      </DialogActions>
    </>
  );
};

export default NovaEntrega;
