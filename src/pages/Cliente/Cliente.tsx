import { DataGridPro, GridColDef, GridRowsProp } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import { Button, Container, Typography, Box } from '@mui/material';


const Cliente = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const token = getAccessToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/cliente`, config);
        const data = response.data.map((item: any, index: number) => ({
          id: index + 1,
          uf: item.uf,
          cep: item.cep,
          cnpj: item.cnpj,
          email: item.email,
          porte: item.porte,
          bairro: item.bairro,
          numero: item.numero,
          municipio: item.municipio,
          logradouro: item.logradouro,
          cnae_fiscal: item.cnae_fiscal,
          complemento: item.complemento,
          razao_social: item.razao_social,
          nome_fantasia: item.nome_fantasia,
          capital_social: item.capital_social,
          ddd_telefone_1: item.ddd_telefone_1,
          ddd_telefone_2: item.ddd_telefone_2,
          representante_legal_1: item.representante_legal_1,
          cpf_representante_legal_1: item.cpf_representante_legal_1,
          representante_legal_2: item.representante_legal_2,
          cpf_representante_legal_2: item.cpf_representante_legal_2,
          natureza_juridica: item.natureza_juridica,
          opcao_pelo_simples: item.opcao_pelo_simples,
          cnae_fiscal_descricao: item.cnae_fiscal_descricao,
          data_situacao_cadastral: item.data_situacao_cadastral,
          descricao_situacao_cadastral: item.descricao_situacao_cadastral,
          descricao_identificador_matriz_filial: item.descricao_identificador_matriz_filial,
          cnae_secundario: item.cnae_secundario,
          numero_funcionarios: item.numero_funcionarios,
          valor_fatura_cliente: item.valor_fatura_cliente,
          ponto_apoio: item.ponto_apoio,
          perfil: item.perfil,
          area_atuacao: item.area_atuacao,
          segmento: item.segmento,
          numero_reunioes: item.numero_reunioes,
          status: item.status,
          data_contratacao_fast: item.data_contratacao_fast,
          data_saida_fast: item.data_saida_fast,
          nome_ponte: item.nome_ponte,
          consultor_comercial: item.consultor_comercial,
          consultor_financeiro: item.consultor_financeiro,
          analista: item.analista,
          cliente_fast: item.cliente_fast ?? false,
          parceiro: item.parceiro ?? false,
          prospeccao: item.prospeccao ?? false,
          origem_lead: item.origem_lead,
          data_reajuste_financeiro: item.data_reajuste_financeiro,
          porcentagem_reajuste_financeiro: item.porcentagem_reajuste_financeiro,
          data_aviso_previo: item.data_aviso_previo,
          empresa_contratada: item.empresa_contratada,
          vencimento_fatura_1: item.vencimento_fatura_1,
          vencimento_fatura_2: item.vencimento_fatura_2,
          observacao_fatura: item.observacao_fatura,
          indicacao_lead: item.indicacao_lead,
          comissao_indicacao: item.comissao_indicacao,
          comissao_fechamento: item.comissao_fechamento,
        }));
        setRows(data);
        console.log('Dados:', data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (row: any) => {
    setEditRowId(row.id);
    setEditData({
      ...row,
      // Formatar valor para máscara pt-BR ao entrar em edição
      valor_fatura_cliente:
        row.valor_fatura_cliente != null && row.valor_fatura_cliente !== ''
          ? Number(row.valor_fatura_cliente).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : ''
    });
  };

  const handleEditChange = React.useCallback((field: string, value: any) => {
    // Special handling for cliente_fast field when setting to false
    if (field === 'cliente_fast' && value === false && editData.cliente_fast === true) {
      const confirmed = window.confirm(`Gostaria de remover ${editData.razao_social} como cliente fast?`);
      if (!confirmed) {
        return; // Cancel the change if user clicks "No"
      }
    }
    
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  }, [editData.cliente_fast, editData.razao_social]);

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditData({});
  };

  const handleSaveEdit = React.useCallback(async () => {
  
    
    setLoading(true);
    try {
      const token = getAccessToken();
      let patchData = { ...editData };
      // Normaliza Valor da Fatura (string pt-BR -> número)
      if (typeof patchData.valor_fatura_cliente === 'string') {
        const cleaned = patchData.valor_fatura_cliente.replace(/\./g, '').replace(',', '.').trim();
        const num = cleaned === '' ? null : parseFloat(cleaned);
        if (num == null || Number.isNaN(num)) {
          delete (patchData as any).valor_fatura_cliente; // evita enviar NaN
        } else {
          (patchData as any).valor_fatura_cliente = num;
        }
      }
      if (patchData.cliente_fast === false) {
        patchData.data_saida_fast = new Date().toISOString();
      }
      
      // Sanitize CNPJ to remove formatting before sending to API
      if (patchData.cnpj) {
        patchData.cnpj = patchData.cnpj.replace(/\D/g, '');
      }

      // Convert empty date strings to null
      const dateFields = [
        'data_situacao_cadastral',
        'data_contratacao_fast', 
        'data_saida_fast',
        'data_reajuste_financeiro',
        'data_aviso_previo'
      ];
      
      dateFields.forEach(field => {
        if (patchData[field] === '') {
          patchData[field] = null;
        }
      });

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/loja/update/${editData.cnpj}`,
        patchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRows((prevRows) => prevRows.map((row: any) => (row.id === editRowId ? { ...row, ...patchData } : row)));
      setEditRowId(null);
      setEditData({});
      alert('Cliente atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar cliente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [editData, editRowId]);

  const columns: GridColDef[] = [
    { field: 'razao_social', headerName: 'Razão Social', width: 300 },
    { field: 'cnpj', headerName: 'CNPJ', width: 140 },
    { field: 'valor_fatura_cliente', headerName: 'Valor da Fatura', width: 150 },  
    { 
      field: 'data_contratacao_fast', 
      headerName: 'Data de Contratação Fast', 
      width: 180,
      renderCell: (params: any) => {
        if (!params.value) return '';
        try {
          const date = new Date(params.value);
          if (isNaN(date.getTime())) return params.value;
          return date.toLocaleDateString('pt-BR');
        } catch (error) {
          return params.value;
        }
      }
    },
    { field: 'consultor_financeiro', headerName: 'Consultor Financeiro', width: 200 },
    { field: 'analista', headerName: 'Analista', width: 200 },
    { field: 'consultor_comercial', headerName: 'Consultor Comercial', width: 200 },
  ];

  const getDetailPanelContent = React.useCallback((params: any) => {
    const row = params.row;
    const isEditing = editRowId === row.id;
    return (
      <Box sx={{ p: 2, background: '#f9f9f9' }}>
        {isEditing ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>Editar Cliente</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* Dados de Endereço */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Dados de Endereço</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption">UF:</Typography>
                  <input value={editData.uf || ''} onChange={e => handleEditChange('uf', e.target.value)} placeholder="UF" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">CEP:</Typography>
                  <input value={editData.cep || ''} onChange={e => handleEditChange('cep', e.target.value)} placeholder="CEP" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Bairro:</Typography>
                  <input value={editData.bairro || ''} onChange={e => handleEditChange('bairro', e.target.value)} placeholder="Bairro" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Número:</Typography>
                  <input value={editData.numero || ''} onChange={e => handleEditChange('numero', e.target.value)} placeholder="Número" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Município:</Typography>
                  <input value={editData.municipio || ''} onChange={e => handleEditChange('municipio', e.target.value)} placeholder="Município" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Logradouro:</Typography>
                  <input value={editData.logradouro || ''} onChange={e => handleEditChange('logradouro', e.target.value)} placeholder="Logradouro" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Complemento:</Typography>
                  <input value={editData.complemento || ''} onChange={e => handleEditChange('complemento', e.target.value)} placeholder="Complemento" style={{width: '100%', padding: '8px'}} />
                </Box>
              </Box>

              {/* Dados de Contato */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Dados de Contato</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption">Email:</Typography>
                  <input value={editData.email || ''} onChange={e => handleEditChange('email', e.target.value)} placeholder="Email" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">DDD Telefone 1:</Typography>
                  <input value={editData.ddd_telefone_1 || ''} onChange={e => handleEditChange('ddd_telefone_1', e.target.value)} placeholder="DDD Telefone 1" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">DDD Telefone 2:</Typography>
                  <input value={editData.ddd_telefone_2 || ''} onChange={e => handleEditChange('ddd_telefone_2', e.target.value)} placeholder="DDD Telefone 2" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Representante Legal 1:</Typography>
                  <input value={editData.representante_legal_1 || ''} onChange={e => handleEditChange('representante_legal_1', e.target.value)} placeholder="Representante Legal 1" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">CPF Representante Legal 1:</Typography>
                  <input value={editData.cpf_representante_legal_1 || ''} onChange={e => handleEditChange('cpf_representante_legal_1', e.target.value)} placeholder="000.000.000-00" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Representante Legal 2:</Typography>
                  <input value={editData.representante_legal_2 || ''} onChange={e => handleEditChange('representante_legal_2', e.target.value)} placeholder="Representante Legal 2" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">CPF Representante Legal 2:</Typography>
                  <input value={editData.cpf_representante_legal_2 || ''} onChange={e => handleEditChange('cpf_representante_legal_2', e.target.value)} placeholder="000.000.000-00" style={{width: '100%', padding: '8px'}} />
                </Box>
              </Box>

              {/* Dados da Empresa */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Dados da Empresa</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption">Razão Social:</Typography>
                  <input value={editData.razao_social || ''} onChange={e => handleEditChange('razao_social', e.target.value)} placeholder="Razão Social" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Porte:</Typography>
                  <input value={editData.porte || ''} onChange={e => handleEditChange('porte', e.target.value)} placeholder="Porte" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">CNAE Fiscal:</Typography>
                  <input value={editData.cnae_fiscal || ''} onChange={e => handleEditChange('cnae_fiscal', e.target.value)} placeholder="CNAE Fiscal" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Descrição CNAE Fiscal:</Typography>
                  <input value={editData.cnae_fiscal_descricao || ''} onChange={e => handleEditChange('cnae_fiscal_descricao', e.target.value)} placeholder="Descrição CNAE Fiscal" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">CNAE Secundário:</Typography>
                  <input value={editData.cnae_secundario || ''} onChange={e => handleEditChange('cnae_secundario', e.target.value)} placeholder="CNAE Secundário" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Natureza Jurídica:</Typography>
                  <input value={editData.natureza_juridica || ''} onChange={e => handleEditChange('natureza_juridica', e.target.value)} placeholder="Natureza Jurídica" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Capital Social:</Typography>
                  <input type="number" step="0.01" value={editData.capital_social || ''} onChange={e => handleEditChange('capital_social', e.target.value)} placeholder="Capital Social" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Opção pelo Simples:</Typography>
                  <input value={editData.opcao_pelo_simples || ''} onChange={e => handleEditChange('opcao_pelo_simples', e.target.value)} placeholder="Opção pelo Simples" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Data da Situação Cadastral:</Typography>
                  <input type="date" value={editData.data_situacao_cadastral || ''} onChange={e => handleEditChange('data_situacao_cadastral', e.target.value)} placeholder="Data da Situação Cadastral" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Descrição Situação Cadastral:</Typography>
                  <input value={editData.descricao_situacao_cadastral || ''} onChange={e => handleEditChange('descricao_situacao_cadastral', e.target.value)} placeholder="Descrição Situação Cadastral" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Descrição Identificador Matriz/Filial:</Typography>
                  <input value={editData.descricao_identificador_matriz_filial || ''} onChange={e => handleEditChange('descricao_identificador_matriz_filial', e.target.value)} placeholder="Descrição Identificador Matriz/Filial" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Número de Funcionários:</Typography>
                  <input value={editData.numero_funcionarios || ''} onChange={e => handleEditChange('numero_funcionarios', e.target.value)} placeholder="Número de Funcionários" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Ponto de Apoio:</Typography>
                  <input value={editData.ponto_apoio || ''} onChange={e => handleEditChange('ponto_apoio', e.target.value)} placeholder="Ponto de Apoio" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Perfil:</Typography>
                  <input value={editData.perfil || ''} onChange={e => handleEditChange('perfil', e.target.value)} placeholder="Perfil" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Área de Atuação:</Typography>
                  <select value={editData.area_atuacao || ''} onChange={e => handleEditChange('area_atuacao', e.target.value)} style={{width: '100%', padding: '8px'}}>
                    <option value="" disabled>Selecione a área de atuação</option>
                    <option value="industria">Indústria</option>
                    <option value="comercio">Comércio</option>
                    <option value="servicos">Serviços</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </Box>
                <Box>
                  <Typography variant="caption">Segmento:</Typography>
                  <input value={editData.segmento || ''} onChange={e => handleEditChange('segmento', e.target.value)} placeholder="Segmento" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Número de Reuniões:</Typography>
                  <input value={editData.numero_reunioes || ''} onChange={e => handleEditChange('numero_reunioes', e.target.value)} placeholder="Número de Reuniões" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Status:</Typography>
                  <input value={editData.status || ''} onChange={e => handleEditChange('status', e.target.value)} placeholder="Status" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Data de Contratação Fast:</Typography>
                  <input type="date" value={editData.data_contratacao_fast || ''} onChange={e => handleEditChange('data_contratacao_fast', e.target.value)} placeholder="Data de Contratação Fast" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Data de Saída Fast:</Typography>
                  <input type="date" value={editData.data_saida_fast || ''} onChange={e => handleEditChange('data_saida_fast', e.target.value)} placeholder="Data de Saída Fast" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Nome da Ponte:</Typography>
                  <input value={editData.nome_ponte || ''} onChange={e => handleEditChange('nome_ponte', e.target.value)} placeholder="Nome da Ponte" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Consultor Comercial:</Typography>
                  <input value={editData.consultor_comercial || ''} onChange={e => handleEditChange('consultor_comercial', e.target.value)} placeholder="Consultor Comercial" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Consultor Financeiro:</Typography>
                  <input value={editData.consultor_financeiro || ''} onChange={e => handleEditChange('consultor_financeiro', e.target.value)} placeholder="Consultor Financeiro" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Analista:</Typography>
                  <input value={editData.analista || ''} onChange={e => handleEditChange('analista', e.target.value)} placeholder="Analista" style={{width: '100%', padding: '8px'}} />
                </Box>
              </Box>

              {/* Origem e Dados Comerciais */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Origem e Dados Comerciais</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption">Origem do Lead:</Typography>
                  <select value={editData.origem_lead || ''} onChange={e => handleEditChange('origem_lead', e.target.value)} style={{width: '100%', padding: '8px'}}>
                    <option value="" disabled>Selecione a origem do lead</option>
                    <option value="google busca orgânica">Google Busca Orgânica</option>
                    <option value="google ADS">Google ADS</option>
                    <option value="instagram orgânico">Instagram Orgânico</option>
                    <option value="instagram tráfego pago">Instagram Tráfego Pago</option>
                    <option value="TikTok">TikTok</option>
                    <option value="prospecção comercial">Prospecção Comercial</option>
                    <option value="indicação consultor financeiro">Indicação Consultor Financeiro</option>
                    <option value="indicação cliente">Indicação Cliente</option>
                    <option value="network hygor">Network Hygor</option>
                    <option value="indicação parceiro">Indicação Parceiro</option>
                    <option value="evento">Evento</option>
                  </select>
                </Box>
                <Box>
                  <Typography variant="caption">Indicação do Lead:</Typography>
                  <input value={editData.indicacao_lead || ''} onChange={e => handleEditChange('indicacao_lead', e.target.value)} placeholder="Indicação do Lead" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Comissão Indicação (%):</Typography>
                  <input type="number" step="0.01" min="0" max="100" value={editData.comissao_indicacao || ''} onChange={e => handleEditChange('comissao_indicacao', e.target.value)} placeholder="Comissão Indicação (%)" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Comissão Fechamento (%):</Typography>
                  <input type="number" step="0.01" min="0" max="100" value={editData.comissao_fechamento || ''} onChange={e => handleEditChange('comissao_fechamento', e.target.value)} placeholder="Comissão Fechamento (%)" style={{width: '100%', padding: '8px'}} />
                </Box>
              </Box>

              {/* Dados Financeiros */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Dados Financeiros</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption">Valor da Fatura:</Typography>
                  <input
                    inputMode="numeric"
                    value={editData.valor_fatura_cliente || ''}
                    onChange={e => {
                      const digits = (e.target.value || '').toString().replace(/\D/g, '');
                      if (!digits) {
                        handleEditChange('valor_fatura_cliente', '');
                        return;
                      }
                      const masked = (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      handleEditChange('valor_fatura_cliente', masked);
                    }}
                    placeholder="0,00"
                    style={{width: '100%', padding: '8px'}}
                  />
                </Box>
                <Box>
                  <Typography variant="caption">Data do Reajuste Financeiro:</Typography>
                  <input type="date" value={editData.data_reajuste_financeiro || ''} onChange={e => handleEditChange('data_reajuste_financeiro', e.target.value)} placeholder="Data do Reajuste Financeiro" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Porcentagem Reajuste Financeiro (%):</Typography>
                  <input type="number" step="0.01" value={editData.porcentagem_reajuste_financeiro || ''} onChange={e => handleEditChange('porcentagem_reajuste_financeiro', e.target.value)} placeholder="Porcentagem Reajuste Financeiro (%)" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Data do Aviso Prévio:</Typography>
                  <input type="date" value={editData.data_aviso_previo || ''} onChange={e => handleEditChange('data_aviso_previo', e.target.value)} placeholder="Data do Aviso Prévio" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Empresa Contratada:</Typography>
                  <select value={editData.empresa_contratada || ''} onChange={e => handleEditChange('empresa_contratada', e.target.value)} style={{width: '100%', padding: '8px'}}>
                    <option value="" disabled>Selecione a empresa</option>
                    <option value="Prise">Prise</option>
                    <option value="Fast">Fast</option>
                  </select>
                </Box>
                <Box>
                  <Typography variant="caption">Vencimento Fatura 1 (Dia):</Typography>
                  <input type="number" min="1" max="31" value={editData.vencimento_fatura_1 || ''} onChange={e => handleEditChange('vencimento_fatura_1', e.target.value)} placeholder="Vencimento Fatura 1 (Dia)" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box>
                  <Typography variant="caption">Vencimento Fatura 2 (Dia):</Typography>
                  <input type="number" min="0" max="31" value={editData.vencimento_fatura_2 || ''} onChange={e => handleEditChange('vencimento_fatura_2', e.target.value)} placeholder="Vencimento Fatura 2 (Dia)" style={{width: '100%', padding: '8px'}} />
                </Box>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="caption">Observação Fatura:</Typography>
                  <textarea value={editData.observacao_fatura || ''} onChange={e => handleEditChange('observacao_fatura', e.target.value)} placeholder="Observação Fatura" rows={3} style={{width: '100%', padding: '8px'}}></textarea>
                </Box>
              </Box>

              {/* Classificações */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Classificações</Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!editData.cliente_fast}
                      onChange={e => handleEditChange('cliente_fast', e.target.checked)}
                    /> Cliente Fast
                  </label>
                </Box>
                <Box>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!editData.parceiro}
                      onChange={e => handleEditChange('parceiro', e.target.checked)}
                    /> Parceiro Fast
                  </label>
                </Box>
                <Box>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!editData.prospeccao}
                      onChange={e => handleEditChange('prospeccao', e.target.checked)}
                    /> Funil
                  </label>
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSaveEdit} disabled={loading}>Salvar</Button>
              <Button variant="outlined" onClick={handleCancelEdit} disabled={loading}>Cancelar</Button>
            </Box>
          </>
        ) : (
          <>
            <Typography><strong>UF:</strong> {row.uf}</Typography>
            <Typography><strong>CEP:</strong> {row.cep}</Typography>
            <Typography><strong>Email:</strong> {row.email}</Typography>
            <Typography><strong>Porte:</strong> {row.porte}</Typography>
            <Typography><strong>Bairro:</strong> {row.bairro}</Typography>
            <Typography><strong>Número:</strong> {row.numero}</Typography>
            <Typography><strong>Município:</strong> {row.municipio}</Typography>
            <Typography><strong>Logradouro:</strong> {row.logradouro}</Typography>
            <Typography><strong>CNAE Fiscal:</strong> {row.cnae_fiscal}</Typography>
            <Typography><strong>Complemento:</strong> {row.complemento}</Typography>
            <Typography><strong>DDD Telefone 1:</strong> {row.ddd_telefone_1}</Typography>
            <Typography><strong>DDD Telefone 2:</strong> {row.ddd_telefone_2}</Typography>
            <Typography><strong>Representante Legal 1:</strong> {row.representante_legal_1}</Typography>
            <Typography><strong>CPF Representante Legal 1:</strong> {row.cpf_representante_legal_1}</Typography>
            <Typography><strong>Representante Legal 2:</strong> {row.representante_legal_2}</Typography>
            <Typography><strong>CPF Representante Legal 2:</strong> {row.cpf_representante_legal_2}</Typography>
            <Typography><strong>Natureza Jurídica:</strong> {row.natureza_juridica}</Typography>
            <Typography><strong>Capital Social:</strong> {row.capital_social}</Typography>
            <Typography><strong>Opção pelo Simples:</strong> {row.opcao_pelo_simples ? 'Sim' : 'Não'}</Typography>
            <Typography><strong>Descrição CNAE Fiscal:</strong> {row.cnae_fiscal_descricao}</Typography>
            <Typography><strong>Data da Situação Cadastral:</strong> {row.data_situacao_cadastral ? new Date(row.data_situacao_cadastral).toLocaleDateString('pt-BR') : ''}</Typography>
            <Typography><strong>Descrição Situação Cadastral:</strong> {row.descricao_situacao_cadastral}</Typography>
            <Typography><strong>Descrição Identificador Matriz/Filial:</strong> {row.descricao_identificador_matriz_filial}</Typography>
            <Typography><strong>CNAE Secundário:</strong> {row.cnae_secundario}</Typography>
            <Typography><strong>Número de Funcionários:</strong> {row.numero_funcionarios}</Typography>
            <Typography><strong>Valor da Fatura:</strong> {row.valor_fatura_cliente}</Typography>
            <Typography><strong>Ponto de Apoio:</strong> {row.ponto_apoio}</Typography>
            <Typography><strong>Perfil:</strong> {row.perfil}</Typography>
            <Typography><strong>Área de Atuação:</strong> {row.area_atuacao}</Typography>
            <Typography><strong>Segmento:</strong> {row.segmento}</Typography>
            <Typography><strong>Número de Reuniões:</strong> {row.numero_reunioes}</Typography>
            <Typography><strong>Status:</strong> {row.status}</Typography>
            <Typography><strong>Data de Contratação Fast:</strong> {row.data_contratacao_fast ? new Date(row.data_contratacao_fast).toLocaleDateString('pt-BR') : ''}</Typography>
            <Typography><strong>Data de Saída Fast:</strong> {row.data_saida_fast ? new Date(row.data_saida_fast).toLocaleDateString('pt-BR') : ''}</Typography>
            <Typography><strong>Nome da Ponte:</strong> {row.nome_ponte}</Typography>
            <Typography><strong>Consultor Comercial:</strong> {row.consultor_comercial}</Typography>
            <Typography><strong>Consultor Financeiro:</strong> {row.consultor_financeiro}</Typography>
            <Typography><strong>Analista:</strong> {row.analista}</Typography>
            <Typography><strong>Cliente Fast:</strong> {row.cliente_fast ? 'Sim' : 'Não'}</Typography>
            <Typography><strong>Parceiro Fast:</strong> {row.parceiro ? 'Sim' : 'Não'}</Typography>
            <Typography><strong>Funil:</strong> {row.prospeccao ? 'Sim' : 'Não'}</Typography>
            
            {/* Novos campos adicionados */}
            <Typography><strong>Origem do Lead:</strong> {row.origem_lead}</Typography>
            <Typography><strong>Data do Reajuste Financeiro:</strong> {row.data_reajuste_financeiro ? new Date(row.data_reajuste_financeiro).toLocaleDateString('pt-BR') : ''}</Typography>
            <Typography><strong>Porcentagem Reajuste Financeiro:</strong> {row.porcentagem_reajuste_financeiro}%</Typography>
            <Typography><strong>Data do Aviso Prévio:</strong> {row.data_aviso_previo ? new Date(row.data_aviso_previo).toLocaleDateString('pt-BR') : ''}</Typography>
            <Typography><strong>Empresa Contratada:</strong> {row.empresa_contratada}</Typography>
            <Typography><strong>Vencimento Fatura 1:</strong> {row.vencimento_fatura_1}</Typography>
            <Typography><strong>Vencimento Fatura 2:</strong> {row.vencimento_fatura_2}</Typography>
            <Typography><strong>Observação Fatura:</strong> {row.observacao_fatura}</Typography>
            <Typography><strong>Indicação do Lead:</strong> {row.indicacao_lead}</Typography>
            <Typography><strong>Comissão Indicação:</strong> {row.comissao_indicacao}%</Typography>
            <Typography><strong>Comissão Fechamento:</strong> {row.comissao_fechamento}%</Typography>
            
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleEditClick(row)}>Editar</Button>
          </>
        )}
      </Box>
    );
  }, [editRowId, editData, loading, handleSaveEdit, handleEditChange]);

  const getDetailPanelHeight = React.useCallback(() => 600, []);



  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Clientes Fast Assessoria
      </Typography> 
      <div style={{ height: 600, width: '100%', marginTop: 20 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          autoPageSize
          getDetailPanelContent={getDetailPanelContent}
          getDetailPanelHeight={getDetailPanelHeight}
          disableRowSelectionOnClick={true}
        />
      </div>
    </Container>
  );
};

export default Cliente;