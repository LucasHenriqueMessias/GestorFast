import { DataGridPro, GridColDef, GridRowsProp } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import { Button, Container, Typography, useTheme, Box } from '@mui/material';

const Cliente = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = getAccessToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja`, config);
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
          renda_bruta_inicial: item.renda_bruta_inicial,
          renda_bruta_atual: item.renda_bruta_atual,
          renda_liquida_inicial: item.renda_liquida_inicial,
          renda_liquida_atual: item.renda_liquida_atual,
          cnae_secundario: item.cnae_secundario,
          numero_funcionarios: item.numero_funcionarios,
          valor_faturamento: item.valor_faturamento,
          valor_faturamento_inicial: item.valor_faturamento_inicial,
          ponto_apoio: item.ponto_apoio,
          perfil: item.perfil,
          area_atuacao: item.area_atuacao,
          segmento: item.segmento,
          numero_reunioes: item.numero_reunioes,
          status: item.status,
          data_contratacao_fast: item.data_contratacao_fast,
          data_saida_fast: item.data_saida_fast,
          nome_ponte: item.nome_ponte,
        }));
        setRows(data);
        console.log('Dados:', data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const columns: GridColDef[] = [
    { field: 'razao_social', headerName: 'Razão Social', width: 300 },
    { field: 'cnpj', headerName: 'CNPJ', width: 140 },
    { field: 'renda_bruta_inicial', headerName: 'Renda Bruta Inicial', flex: 1 },
    { field: 'renda_bruta_atual', headerName: 'Renda Bruta Atual', flex: 1 },
    { field: 'renda_liquida_inicial', headerName: 'Renda Líquida Inicial', flex: 1 },
    { field: 'renda_liquida_atual', headerName: 'Renda Líquida Atual', flex: 1 },
  ];

  const handleRowClick = (params: any) => {
    setExpandedRow(expandedRow === params.id ? null : params.id);
  };

  const renderDetailPanel = (row: any) => (
    <Box>
      <Typography variant="h6">Detalhes</Typography>
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
      <Typography><strong>Valor de Faturamento:</strong> {row.valor_faturamento}</Typography>
      <Typography><strong>Valor de Faturamento Inicial:</strong> {row.valor_faturamento_inicial}</Typography>
      <Typography><strong>Ponto de Apoio:</strong> {row.ponto_apoio}</Typography>
      <Typography><strong>Perfil:</strong> {row.perfil}</Typography>
      <Typography><strong>Área de Atuação:</strong> {row.area_atuacao}</Typography>
      <Typography><strong>Segmento:</strong> {row.segmento}</Typography>
      <Typography><strong>Número de Reuniões:</strong> {row.numero_reunioes}</Typography>
      <Typography><strong>Status:</strong> {row.status}</Typography>
      <Typography><strong>Data de Contratação Fast:</strong> {row.data_contratacao_fast}</Typography>
      <Typography><strong>Data de Saída Fast:</strong> {row.data_saida_fast}</Typography>
      <Typography><strong>Nome da Ponte:</strong> {row.nome_ponte}</Typography>
    </Box>
  );

  const theme = useTheme();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Clientes Fast Assessoria
      </Typography>
      <Button variant="contained" color="primary">
        Adicionar Novo Cliente
      </Button>
      <div style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          autoPageSize
        
          onRowClick={handleRowClick}
        />
        {expandedRow && renderDetailPanel(rows.find((row: any) => row.id === expandedRow))}
      </div>
    </Container>
  );
};

export default Cliente;