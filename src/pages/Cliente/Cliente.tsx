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
    setEditData({ ...row });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditData({});
  };

  const handleSaveEdit = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      let patchData = { ...editData };
      if (patchData.cliente_fast === false) {
        patchData.data_saida_fast = new Date().toISOString();
      }
      await axios.patch(
        `http://localhost:3002/loja/update/${editData.cnpj}`,
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
    { field: 'data_contratacao_fast', headerName: 'Data de Contratação Fast', width: 180 },
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <input value={editData.uf || ''} onChange={e => handleEditChange('uf', e.target.value)} placeholder="UF" />
              <input value={editData.cep || ''} onChange={e => handleEditChange('cep', e.target.value)} placeholder="CEP" />
              <input value={editData.email || ''} onChange={e => handleEditChange('email', e.target.value)} placeholder="Email" />
              <input value={editData.porte || ''} onChange={e => handleEditChange('porte', e.target.value)} placeholder="Porte" />
              <input value={editData.bairro || ''} onChange={e => handleEditChange('bairro', e.target.value)} placeholder="Bairro" />
              <input value={editData.numero || ''} onChange={e => handleEditChange('numero', e.target.value)} placeholder="Número" />
              <input value={editData.municipio || ''} onChange={e => handleEditChange('municipio', e.target.value)} placeholder="Município" />
              <input value={editData.logradouro || ''} onChange={e => handleEditChange('logradouro', e.target.value)} placeholder="Logradouro" />
              <input value={editData.cnae_fiscal || ''} onChange={e => handleEditChange('cnae_fiscal', e.target.value)} placeholder="CNAE Fiscal" />
              <input value={editData.complemento || ''} onChange={e => handleEditChange('complemento', e.target.value)} placeholder="Complemento" />
              <input value={editData.ddd_telefone_1 || ''} onChange={e => handleEditChange('ddd_telefone_1', e.target.value)} placeholder="DDD Telefone 1" />
              <input value={editData.ddd_telefone_2 || ''} onChange={e => handleEditChange('ddd_telefone_2', e.target.value)} placeholder="DDD Telefone 2" />
              <input value={editData.natureza_juridica || ''} onChange={e => handleEditChange('natureza_juridica', e.target.value)} placeholder="Natureza Jurídica" />
              <input value={editData.opcao_pelo_simples || ''} onChange={e => handleEditChange('opcao_pelo_simples', e.target.value)} placeholder="Opção pelo Simples" />
              <input value={editData.cnae_fiscal_descricao || ''} onChange={e => handleEditChange('cnae_fiscal_descricao', e.target.value)} placeholder="Descrição CNAE Fiscal" />
              <input value={editData.data_situacao_cadastral || ''} onChange={e => handleEditChange('data_situacao_cadastral', e.target.value)} placeholder="Data Situação Cadastral" />
              <input value={editData.descricao_situacao_cadastral || ''} onChange={e => handleEditChange('descricao_situacao_cadastral', e.target.value)} placeholder="Descrição Situação Cadastral" />
              <input value={editData.descricao_identificador_matriz_filial || ''} onChange={e => handleEditChange('descricao_identificador_matriz_filial', e.target.value)} placeholder="Descrição Identificador Matriz/Filial" />
              <input value={editData.cnae_secundario || ''} onChange={e => handleEditChange('cnae_secundario', e.target.value)} placeholder="CNAE Secundário" />
              <input value={editData.numero_funcionarios || ''} onChange={e => handleEditChange('numero_funcionarios', e.target.value)} placeholder="Número de Funcionários" />
              <input value={editData.valor_fatura_cliente || ''} onChange={e => handleEditChange('valor_fatura_cliente', e.target.value)} placeholder="Valor da Fatura" />
              <input value={editData.ponto_apoio || ''} onChange={e => handleEditChange('ponto_apoio', e.target.value)} placeholder="Ponto de Apoio" />
              <input value={editData.perfil || ''} onChange={e => handleEditChange('perfil', e.target.value)} placeholder="Perfil" />
              <input value={editData.area_atuacao || ''} onChange={e => handleEditChange('area_atuacao', e.target.value)} placeholder="Área de Atuação" />
              <input value={editData.segmento || ''} onChange={e => handleEditChange('segmento', e.target.value)} placeholder="Segmento" />
              <input value={editData.numero_reunioes || ''} onChange={e => handleEditChange('numero_reunioes', e.target.value)} placeholder="Número de Reuniões" />
              <input value={editData.status || ''} onChange={e => handleEditChange('status', e.target.value)} placeholder="Status" />
              <input value={editData.data_contratacao_fast || ''} onChange={e => handleEditChange('data_contratacao_fast', e.target.value)} placeholder="Data de Contratação Fast" />
              <input value={editData.data_saida_fast || ''} onChange={e => handleEditChange('data_saida_fast', e.target.value)} placeholder="Data de Saída Fast" />
              <input value={editData.nome_ponte || ''} onChange={e => handleEditChange('nome_ponte', e.target.value)} placeholder="Nome da Ponte" />
              <input value={editData.consultor_comercial || ''} onChange={e => handleEditChange('consultor_comercial', e.target.value)} placeholder="Consultor Comercial" />
              <input value={editData.consultor_financeiro || ''} onChange={e => handleEditChange('consultor_financeiro', e.target.value)} placeholder="Consultor Financeiro" />
              <input value={editData.analista || ''} onChange={e => handleEditChange('analista', e.target.value)} placeholder="Analista" />
              <Box>
                <label>
                  <input
                    type="checkbox"
                    checked={!!editData.cliente_fast}
                    onChange={e => handleEditChange('cliente_fast', e.target.checked)}
                  /> Cliente Fast
                </label>
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
            <Typography><strong>Natureza Jurídica:</strong> {row.natureza_juridica}</Typography>
            <Typography><strong>Opção pelo Simples:</strong> {row.opcao_pelo_simples ? 'Sim' : 'Não'}</Typography>
            <Typography><strong>Descrição CNAE Fiscal:</strong> {row.cnae_fiscal_descricao}</Typography>
            <Typography><strong>Data Situação Cadastral:</strong> {row.data_situacao_cadastral}</Typography>
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
            <Typography><strong>Data de Contratação Fast:</strong> {row.data_contratacao_fast}</Typography>
            <Typography><strong>Data de Saída Fast:</strong> {row.data_saida_fast ? new Date(row.data_saida_fast).toLocaleDateString('pt-BR') : ''}</Typography>
            <Typography><strong>Nome da Ponte:</strong> {row.nome_ponte}</Typography>
            <Typography><strong>Consultor Comercial:</strong> {row.consultor_comercial}</Typography>
            <Typography><strong>Consultor Financeiro:</strong> {row.consultor_financeiro}</Typography>
            <Typography><strong>Analista:</strong> {row.analista}</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleEditClick(row)}>Editar</Button>
          </>
        )}
      </Box>
    );
  }, [editRowId, editData, loading, handleSaveEdit]);

  const getDetailPanelHeight = React.useCallback(() => 400, []);



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