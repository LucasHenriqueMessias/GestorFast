import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Box, Paper } from '@mui/material';

function formatCNPJ(value: string) {
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{2})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1/$2');
  value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  return value;
}

const Consultar: React.FC = () => {
  const [cnpj, setCnpj] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatCNPJ(e.target.value);
    setCnpj(masked);
  };

  const handleConsultar = async () => {
    setError('');
    setData(null);
    setLoading(true);
    try {
      const cnpjNumbers = cnpj.replace(/\D/g, '');
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumbers}`);
      setData(response.data);
    } catch (err: any) {
      setError('CNPJ não encontrado ou inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Consulta de CNPJ</Typography>
        <TextField
          label="CNPJ"
          value={cnpj}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="00.000.000/0000-00"
          inputProps={{ maxLength: 18 }}
        />
        <Button variant="contained" color="primary" onClick={handleConsultar} disabled={loading || cnpj.replace(/\D/g, '').length !== 14} fullWidth>
          {loading ? 'Consultando...' : 'Consultar'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {data && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Dados da Empresa</Typography>
            <Box sx={{ mb: 1 }}><strong>Razão Social:</strong> {data.razao_social}</Box>
            <Box sx={{ mb: 1 }}><strong>Nome Fantasia:</strong> {data.nome_fantasia || '-'}</Box>
            <Box sx={{ mb: 1 }}><strong>CNPJ:</strong> {data.cnpj}</Box>
            <Box sx={{ mb: 1 }}><strong>Data de Abertura:</strong> {data.data_inicio_atividade}</Box>
            <Box sx={{ mb: 1 }}><strong>Natureza Jurídica:</strong> {data.natureza_juridica}</Box>
            <Box sx={{ mb: 1 }}><strong>Capital Social:</strong> R$ {data.capital_social?.toLocaleString('pt-BR')}</Box>
            <Box sx={{ mb: 1 }}><strong>Status:</strong> {data.descricao_situacao_cadastral}</Box>
            <Box sx={{ mb: 1 }}><strong>Porte:</strong> {data.porte}</Box>
            <Box sx={{ mb: 1 }}><strong>Tipo:</strong> {data.descricao_identificador_matriz_filial}</Box>
            <Box sx={{ mb: 1 }}><strong>Simples Nacional:</strong> {data.opcao_pelo_simples ? 'Sim' : 'Não'}</Box>
            <Box sx={{ mb: 1 }}><strong>MEI:</strong> {data.opcao_pelo_mei ? 'Sim' : 'Não'}</Box>
            <Box sx={{ mb: 1 }}><strong>UF:</strong> {data.uf}</Box>
            <Box sx={{ mb: 1 }}><strong>Município:</strong> {data.municipio}</Box>
            <Box sx={{ mb: 1 }}><strong>Bairro:</strong> {data.bairro}</Box>
            <Box sx={{ mb: 1 }}><strong>Logradouro:</strong> {data.logradouro}</Box>
            <Box sx={{ mb: 1 }}><strong>Número:</strong> {data.numero}</Box>
            <Box sx={{ mb: 1 }}><strong>CEP:</strong> {data.cep}</Box>
            <Box sx={{ mb: 1 }}><strong>Complemento:</strong> {data.complemento || '-'}</Box>
            <Box sx={{ mb: 1 }}><strong>CNAE Principal:</strong> {data.cnae_fiscal} - {data.cnae_fiscal_descricao}</Box>
            <Box sx={{ mb: 1 }}><strong>CNAEs Secundários:</strong> {data.cnaes_secundarios && data.cnaes_secundarios.length > 0 ? data.cnaes_secundarios.map((cnae: any) => `${cnae.codigo} - ${cnae.descricao}`).join(', ') : '-'}</Box>
            <Box sx={{ mb: 1 }}><strong>Sócios da Empresa:</strong>
              {data.qsa && data.qsa.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {data.qsa.map((socio: any, idx: number) => (
                    <li key={idx}>
                      <strong>{socio.nome_socio}</strong> ({socio.qualificacao_socio}) - Entrada: {socio.data_entrada_sociedade} - Faixa Etária: {socio.faixa_etaria}
                    </li>
                  ))}
                </ul>
              ) : '-'
              }
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Consultar;