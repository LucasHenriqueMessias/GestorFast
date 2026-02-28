import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

interface EmpresaData {
  cnpj: string;
  razao_social: string;
}

interface DREData {
  id: number;
  Data: string;
  Descricao: string;
  Valor: number;
  AnaliseVertical: number;
  AnaliseHorizontal: number;
  Cliente: string;
  Usuario: string;
}

interface FotografiaData {
  id: number;
  usuario: string;
  cliente: string;
  data_criacao: string;
  ferramentas: string;
  antecipacao_recebiveis: string;
  pagamento_impostos_mes: string;
  faturamento: string;
  novas_fontes_receita: string;
  numero_funcionarios: string;
  numero_clientes: string;
  margem_lucro: string;
  parcelas_mensais: number;
  juros_mensais_pagos: number;
  inadimplencia: number;
  estrutura: string;
  cultura_empresarial: string;
  pro_labore: number;
  fotografia_inicial: boolean;
}

interface DoresData {
  id: number;
  cliente: string;
  consultor: string;
  ausencia_salario: number;
  desconhecimento_lucratividade: number;
  precos_informal: number;
  ausencia_projecao: number;
  centralizacao_decisoes: number;
  ausencia_planejamento: number;
  ausencia_estrategia: number;
  inadequacao_estrutura: number;
  ausencia_controles: number;
  ausencia_processos: number;
  ausencia_tecnologia: number;
  ausencia_inovacao: number;
  ausencia_capital: number;
  utilizacao_linhas_credito: number;
  suporte_contabil_inadequado: number;
  data_criacao: string;
}

interface FerramentasData {
  id: number;
  nome_ferramenta: string;
  data_criacao: string;
  data_alteracao: string;
  usuario_criacao: string;
  diretorio: string | null;
  descricao: string;
  tipo: string | null;
  url: string;
  cliente: string;
}

interface ReuniaoData {
  id: number;
  user: string;
  cliente: string;
  status: string;
  tipo_reuniao: string;
  local_reuniao: string;
  Ata_reuniao: string;
  data_realizada: string;
  data_criacao: string;
  nps_reuniao: number;
}

interface SinalAmareloData {
  id: number;
  usuario: string;
  cliente: string;
  status: string;
  data_criacao: string;
  motivoSinal: string;
}

interface SociosData {
  id: number;
  razao_social: string;
  nome_socio: string;
  idade: number;
  cnpj_cpf_do_socio: string;
  data_nascimento: string;
  data_entrada_sociedade: string;
  formacao: string;
  disc: string;
  sedirp: string;
  eneagrama: string;
  hobbies: string;
  relatorio_prospeccao: string;
  opcao_pelo_mei: boolean;
}

interface LTVData {
  razao_social: string;
  valor_fatura_mensal: number;
  data_contratacao: string;
  meses_ativo: number;
  ltv: number;
}

const RelatorioCliente = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<EmpresaData[]>([]);
  const [selectedCNPJ, setSelectedCNPJ] = useState<string>('');
  const [selectedRazaoSocial, setSelectedRazaoSocial] = useState<string>('');
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dreData, setDreData] = useState<DREData[]>([]);
  const [loadingDRE, setLoadingDRE] = useState(false);
  const [dreError, setDreError] = useState<string | null>(null);
  const [fotografiaData, setFotografiaData] = useState<FotografiaData[]>([]);
  const [loadingFotografia, setLoadingFotografia] = useState(false);
  const [fotografiaError, setFotografiaError] = useState<string | null>(null);
  const [doresData, setDoresData] = useState<DoresData[]>([]);
  const [loadingDores, setLoadingDores] = useState(false);
  const [doresError, setDoresError] = useState<string | null>(null);
  const [ferramentasData, setFerramentasData] = useState<FerramentasData[]>([]);
  const [loadingFerramentas, setLoadingFerramentas] = useState(false);
  const [ferramentasError, setFerramentasError] = useState<string | null>(null);
  const [reuniaoData, setReuniaoData] = useState<ReuniaoData[]>([]);
  const [loadingReuniao, setLoadingReuniao] = useState(false);
  const [reuniaoError, setReuniaoError] = useState<string | null>(null);
  const [sinalAmareloData, setSinalAmareloData] = useState<SinalAmareloData[]>([]);
  const [loadingSinalAmarelo, setLoadingSinalAmarelo] = useState(false);
  const [sinalAmareloError, setSinalAmareloError] = useState<string | null>(null);
  const [sociosData, setSociosData] = useState<SociosData[]>([]);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [sociosError, setSociosError] = useState<string | null>(null);
  const [ltvData, setLtvData] = useState<LTVData | null>(null);
  const [loadingLTV, setLoadingLTV] = useState(false);
  const [ltvError, setLtvError] = useState<string | null>(null);

  // Fetch empresas from CNPJ API
  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoadingEmpresas(true);
      setError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/cnpj`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const empresasList = response.data || [];
        setEmpresas(empresasList);
        
      } catch (err) {
        console.error('Erro ao buscar empresas:', err);
        
        // Fallback para dados mock em caso de erro
        const mockEmpresas: EmpresaData[] = [
          {
            "cnpj": "71189278000105",
            "razao_social": "ORLETTI VEICULOS E PECAS LTDA"
          },
          {
            "cnpj": "50364488000104",
            "razao_social": "THERAFARMA DROGARIA LTDA."
          }
        ];
        
        setEmpresas(mockEmpresas);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError('Token de acesso inválido ou expirado - usando dados simulados');
          } else if (err.response?.status === 404) {
            setError('Endpoint não encontrado - usando dados simulados');
          } else {
            setError(`Erro na API: ${err.response?.status} - usando dados simulados`);
          }
        } else {
          setError('Erro de conexão - usando dados simulados');
        }
      } finally {
        setLoadingEmpresas(false);
      }
    };

    fetchEmpresas();
  }, []);

  // Fetch DRE data when razao social is selected
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setDreData([]);
      setDreError(null);
      return;
    }

    const fetchDREData = async () => {
      setLoadingDRE(true);
      setDreError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-dre/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const dreList = response.data || [];
        setDreData(dreList);
        
      } catch (err) {
        console.error('Erro ao buscar dados DRE:', err);
        
        // Fallback para dados mock em caso de erro
        const mockDREData: DREData[] = [
          {
            "id": 4,
            "Data": "2025-07-18T00:00:00.000Z",
            "Descricao": "despesas de marketing",
            "Valor": 500,
            "AnaliseVertical": 0,
            "AnaliseHorizontal": 0,
            "Cliente": selectedRazaoSocial,
            "Usuario": "lucas.goncalves"
          },
          {
            "id": 7,
            "Data": "2025-07-17T00:00:00.000Z",
            "Descricao": "despesas de marketing",
            "Valor": 5,
            "AnaliseVertical": 0,
            "AnaliseHorizontal": 0,
            "Cliente": selectedRazaoSocial,
            "Usuario": "lucas.goncalves"
          },
          {
            "id": 1,
            "Data": "2025-06-22T00:00:00.000Z",
            "Descricao": "Receita Líquida",
            "Valor": 1561,
            "AnaliseVertical": 24,
            "AnaliseHorizontal": 21,
            "Cliente": selectedRazaoSocial,
            "Usuario": "lucas.goncalves"
          }
        ];
        
        setDreData(mockDREData);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setDreError('Token de acesso inválido ou expirado - usando dados simulados');
          } else if (err.response?.status === 404) {
            setDreError('Dados DRE não encontrados - usando dados simulados');
          } else {
            setDreError(`Erro na API DRE: ${err.response?.status} - usando dados simulados`);
          }
        } else {
          setDreError('Erro de conexão DRE - usando dados simulados');
        }
      } finally {
        setLoadingDRE(false);
      }
    };

    fetchDREData();
  }, [selectedRazaoSocial]);

  // Fetch Fotografia data when razao social is selected
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setFotografiaData([]);
      setFotografiaError(null);
      return;
    }

    const fetchFotografiaData = async () => {
      setLoadingFotografia(true);
      setFotografiaError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-fotografia-cliente/cliente/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const fotografiaList = response.data || [];
        setFotografiaData(fotografiaList);
        
      } catch (err) {
        console.error('Erro ao buscar dados Fotografia:', err);
        
        // Fallback para dados mock em caso de erro
        const mockFotografiaData: FotografiaData[] = [
          {
            "id": 1,
            "usuario": "lucas.goncalves",
            "cliente": selectedRazaoSocial,
            "data_criacao": "2025-06-22T00:00:00.000Z",
            "ferramentas": "g",
            "antecipacao_recebiveis": "h",
            "pagamento_impostos_mes": "j",
            "faturamento": "i",
            "novas_fontes_receita": "oji",
            "numero_funcionarios": "j",
            "numero_clientes": "g",
            "margem_lucro": "h",
            "parcelas_mensais": 1500,
            "juros_mensais_pagos": 1500,
            "inadimplencia": 2400,
            "estrutura": "sim",
            "cultura_empresarial": "não",
            "pro_labore": 1505,
            "fotografia_inicial": false
          }
        ];
        
        setFotografiaData(mockFotografiaData);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setFotografiaError('Token de acesso inválido ou expirado - usando dados simulados');
          } else if (err.response?.status === 404) {
            setFotografiaError('Dados de Fotografia não encontrados - usando dados simulados');
          } else {
            setFotografiaError(`Erro na API Fotografia: ${err.response?.status} - usando dados simulados`);
          }
        } else {
          setFotografiaError('Erro de conexão Fotografia - usando dados simulados');
        }
      } finally {
        setLoadingFotografia(false);
      }
    };

    fetchFotografiaData();
  }, [selectedRazaoSocial]);

  // Fetch Dores data when razao social is selected
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setDoresData([]);
      setDoresError(null);
      return;
    }

    const fetchDoresData = async () => {
      setLoadingDores(true);
      setDoresError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-dores-cliente/cliente/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const doresList = response.data || [];
        setDoresData(doresList);
        
      } catch (err) {
        console.error('Erro ao buscar dados Dores:', err);
        
        // Fallback para dados mock em caso de erro
        const mockDoresData: DoresData[] = [
          {
            "id": 2,
            "cliente": selectedRazaoSocial,
            "consultor": "lucas.goncalves",
            "ausencia_salario": 1,
            "desconhecimento_lucratividade": 2,
            "precos_informal": 3,
            "ausencia_projecao": 4,
            "centralizacao_decisoes": 5,
            "ausencia_planejamento": 3,
            "ausencia_estrategia": 4,
            "inadequacao_estrutura": 2,
            "ausencia_controles": 4,
            "ausencia_processos": 1,
            "ausencia_tecnologia": 1,
            "ausencia_inovacao": 2,
            "ausencia_capital": 5,
            "utilizacao_linhas_credito": 4,
            "suporte_contabil_inadequado": 4,
            "data_criacao": "2025-07-21T18:01:27.131Z"
          }
        ];
        
        setDoresData(mockDoresData);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setDoresError('Token de acesso inválido ou expirado - usando dados simulados');
          } else if (err.response?.status === 404) {
            setDoresError('Dados de Dores não encontrados - usando dados simulados');
          } else {
            setDoresError(`Erro na API Dores: ${err.response?.status} - usando dados simulados`);
          }
        } else {
          setDoresError('Erro de conexão Dores - usando dados simulados');
        }
      } finally {
        setLoadingDores(false);
      }
    };

    fetchDoresData();
  }, [selectedRazaoSocial]);

  // Fetch Ferramentas data when razao social is selected
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setFerramentasData([]);
      setFerramentasError(null);
      return;
    }

    const fetchFerramentasData = async () => {
      setLoadingFerramentas(true);
      setFerramentasError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-ferramentas/cliente/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const ferramentasList = response.data || [];
        setFerramentasData(ferramentasList);
        
      } catch (err) {
        console.error('Erro ao buscar dados Ferramentas:', err);
        
        // Fallback para dados mock em caso de erro
        const mockFerramentasData: FerramentasData[] = [
          {
            "id": 6,
            "nome_ferramenta": "Sistema de Gestão",
            "data_criacao": "2025-07-21T18:41:24.975Z",
            "data_alteracao": "2025-07-21T18:41:35.406Z",
            "usuario_criacao": "lucas.goncalves",
            "diretorio": null,
            "descricao": "Sistema completo de gestão empresarial",
            "tipo": null,
            "url": "https://sistema.exemplo.com",
            "cliente": selectedRazaoSocial
          },
          {
            "id": 4,
            "nome_ferramenta": "Dashboard Analytics",
            "data_criacao": "2025-06-26T17:51:15.980Z",
            "data_alteracao": "2025-06-26T19:49:08.034Z",
            "usuario_criacao": "lucas.goncalves",
            "diretorio": null,
            "descricao": "Dashboard para análise de dados empresariais",
            "tipo": null,
            "url": "https://dashboard.exemplo.com",
            "cliente": selectedRazaoSocial
          }
        ];
        
        setFerramentasData(mockFerramentasData);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setFerramentasError('Token de acesso inválido ou expirado - usando dados simulados');
          } else if (err.response?.status === 404) {
            setFerramentasError('Dados de Ferramentas não encontrados - usando dados simulados');
          } else {
            setFerramentasError(`Erro na API Ferramentas: ${err.response?.status} - usando dados simulados`);
          }
        } else {
          setFerramentasError('Erro de conexão Ferramentas - usando dados simulados');
        }
      } finally {
        setLoadingFerramentas(false);
      }
    };

    fetchFerramentasData();
  }, [selectedRazaoSocial]);

  // Fetch Reunion Data
  useEffect(() => {
    if (!selectedRazaoSocial) return;

    const fetchReuniaoData = async () => {
      setLoadingReuniao(true);
      setReuniaoError(null);
      
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-reuniao/cliente/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        setReuniaoData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados de Reunião:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setReuniaoError('Token de acesso inválido ou expirado');
          } else if (error.response?.status === 403) {
            setReuniaoError('Acesso negado ao endpoint de reuniões');
          } else if (error.response?.status === 404) {
            setReuniaoError('Endpoint de reuniões não encontrado');
          } else {
            setReuniaoError(`Erro na API de reuniões: ${error.response?.status}`);
          }
        } else {
          setReuniaoError('Erro de conexão com API de reuniões');
        }
        
        // Não carregar dados mock quando há erro - deixar vazio
        setReuniaoData([]);
      } finally {
        setLoadingReuniao(false);
      }
    };

    fetchReuniaoData();
  }, [selectedRazaoSocial]);

  // Fetch Sinal Amarelo Data
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setSinalAmareloData([]);
      setSinalAmareloError(null);
      return;
    }

    const fetchSinalAmareloData = async () => {
      setLoadingSinalAmarelo(true);
      setSinalAmareloError(null);
      
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-sinal-amarelo/cliente/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        setSinalAmareloData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados de Sinal Amarelo:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setSinalAmareloError('Token de acesso inválido ou expirado');
          } else if (error.response?.status === 403) {
            setSinalAmareloError('Acesso negado ao endpoint de sinal amarelo');
          } else if (error.response?.status === 404) {
            setSinalAmareloError('Endpoint de sinal amarelo não encontrado');
          } else {
            setSinalAmareloError(`Erro na API de sinal amarelo: ${error.response?.status}`);
          }
        } else {
          setSinalAmareloError('Erro de conexão com API de sinal amarelo');
        }
        
        // Não carregar dados mock quando há erro - deixar vazio
        setSinalAmareloData([]);
      } finally {
        setLoadingSinalAmarelo(false);
      }
    };

    fetchSinalAmareloData();
  }, [selectedRazaoSocial]);

  // Fetch Socios Data
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setSociosData([]);
      setSociosError(null);
      return;
    }

    const fetchSociosData = async () => {
      setLoadingSocios(true);
      setSociosError(null);
      
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-socios/razaosocial/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        setSociosData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados de Sócios:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setSociosError('Token de acesso inválido ou expirado');
          } else if (error.response?.status === 403) {
            setSociosError('Acesso negado ao endpoint de sócios');
          } else if (error.response?.status === 404) {
            setSociosError('Endpoint de sócios não encontrado');
          } else {
            setSociosError(`Erro na API de sócios: ${error.response?.status}`);
          }
        } else {
          setSociosError('Erro de conexão com API de sócios');
        }
        
        // Não carregar dados mock quando há erro - deixar vazio
        setSociosData([]);
      } finally {
        setLoadingSocios(false);
      }
    };

    fetchSociosData();
  }, [selectedRazaoSocial]);

  // Fetch LTV data when razao social is selected
  useEffect(() => {
    if (!selectedRazaoSocial) {
      setLtvData(null);
      setLtvError(null);
      return;
    }

    const fetchLTVData = async () => {
      setLoadingLTV(true);
      setLtvError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/LTV/${selectedRazaoSocial}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setLtvData(response.data);
        
      } catch (err) {
        console.error('Erro ao buscar dados LTV:', err);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setLtvError('Token de acesso inválido ou expirado');
          } else if (err.response?.status === 404) {
            setLtvError('Dados LTV não encontrados para este cliente');
          } else {
            setLtvError(`Erro na API LTV: ${err.response?.status}`);
          }
        } else {
          setLtvError('Erro de conexão ao buscar LTV');
        }
        
        setLtvData(null);
      } finally {
        setLoadingLTV(false);
      }
    };

    fetchLTVData();
  }, [selectedRazaoSocial]);

  const handleEmpresaChange = (event: SelectChangeEvent<string>) => {
    const selectedCnpj = event.target.value;
    const empresa = empresas.find(emp => emp.cnpj === selectedCnpj);
    
    setSelectedCNPJ(selectedCnpj);
    setSelectedRazaoSocial(empresa?.razao_social || '');
  };

  // Function to process DRE data by description
  const processDREByDescription = () => {
    const descriptions = [
      'receita bruta',
      'dedução de receita bruta',
      'receita líquida',
      'cmv/cpv/csv',
      'margem de contribuição',
      'despesas administrativas',
      'despesas RH',
      'despesas operacionais',
      'despesas de vendas',
      'despesas de marketing',
      'total de despesas gerais',
      'resultado operacional',
      'despesas financeiras',
      'receitas financeiras',
      'empréstimos',
      'investimentos e aquisições',
      'lucro líquido',
      'retirada sócios',
      'lucro líquido pós retirada'
    ];

    const processedData: Record<string, {
      oldest: DREData | null;
      newest: DREData | null;
      previousToNewest: DREData | null;
      allRecords: DREData[];
      totalValue: number;
      positiveRecords: number;
      negativeRecords: number;
    }> = {};

    descriptions.forEach(description => {
      const records = dreData.filter(item => 
        item.Descricao.toLowerCase() === description.toLowerCase()
      );

      if (records.length > 0) {
        // Sort by date
        const sortedRecords = records.sort((a, b) => 
          new Date(a.Data).getTime() - new Date(b.Data).getTime()
        );

        const totalValue = sortedRecords.reduce((sum, record) => sum + record.Valor, 0);
        const positiveRecords = sortedRecords.filter(record => record.Valor > 0).reduce((sum, record) => sum + record.Valor, 0);
        const negativeRecords = sortedRecords.filter(record => record.Valor <= 0).reduce((sum, record) => sum + record.Valor, 0);

        processedData[description] = {
          oldest: sortedRecords[0],
          newest: sortedRecords[sortedRecords.length - 1],
          previousToNewest: sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 2] : null,
          allRecords: sortedRecords,
          totalValue: totalValue,
          positiveRecords: positiveRecords,
          negativeRecords: negativeRecords
        };
      } else {
        processedData[description] = {
          oldest: null,
          newest: null,
          previousToNewest: null,
          allRecords: [],
          totalValue: 0,
          positiveRecords: 0,
          negativeRecords: 0
        };
      }
    });

    return processedData;
  };

  // Function to process Fotografia data by date
  const processFotografiaByDate = () => {
    if (fotografiaData.length === 0) {
      return {
        oldest: null,
        newest: null,
        total: 0,
        firstPhotoDate: "0",
        lastPhotoDate: "0"
      };
    }

    // Sort by date
    const sortedRecords = fotografiaData.sort((a, b) => 
      new Date(a.data_criacao).getTime() - new Date(b.data_criacao).getTime()
    );

    return {
      oldest: sortedRecords[0],
      newest: sortedRecords[sortedRecords.length - 1],
      total: sortedRecords.length,
      firstPhotoDate: new Date(sortedRecords[0].data_criacao).toLocaleDateString('pt-BR'),
      lastPhotoDate: new Date(sortedRecords[sortedRecords.length - 1].data_criacao).toLocaleDateString('pt-BR')
    };
  };

  // Function to process Dores data by date
  const processDoresByDate = () => {
    if (doresData.length === 0) {
      return {
        oldest: null,
        newest: null,
        total: 0,
        firstEvaluationDate: "0",
        lastEvaluationDate: "0"
      };
    }

    // Sort by date
    const sortedRecords = doresData.sort((a, b) => 
      new Date(a.data_criacao).getTime() - new Date(b.data_criacao).getTime()
    );

    return {
      oldest: sortedRecords[0],
      newest: sortedRecords[sortedRecords.length - 1],
      total: sortedRecords.length,
      firstEvaluationDate: new Date(sortedRecords[0].data_criacao).toLocaleDateString('pt-BR'),
      lastEvaluationDate: new Date(sortedRecords[sortedRecords.length - 1].data_criacao).toLocaleDateString('pt-BR')
    };
  };

  // Function to process Reunion data
  const processReuniaoData = () => {
    if (reuniaoData.length === 0) {
      return {
        mostRecent: null,
        mostRecentRealized: null,
        tipoReuniaoCount: {},
        statusCount: {} as Record<string, number>,
        total: 0,
        lastMeetingDate: "0"
      };
    }

    // Sort by data_realizada to get the most recent
    const sortedByDataRealizada = reuniaoData.sort((a, b) => 
      new Date(b.data_realizada).getTime() - new Date(a.data_realizada).getTime()
    );

    // Get most recent realized meeting (status = "Realizado")
    const realizedMeetings = reuniaoData.filter(reuniao => 
      reuniao.status.toLowerCase() === 'realizado'
    );
    const sortedRealizedMeetings = realizedMeetings.sort((a, b) => 
      new Date(b.data_realizada).getTime() - new Date(a.data_realizada).getTime()
    );

    // Count types of reuniao
    const tipoReuniaoCount = reuniaoData.reduce((acc, reuniao) => {
      const tipo = reuniao.tipo_reuniao;
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count status of reuniao
    const statusCount = reuniaoData.reduce((acc, reuniao) => {
      const status = reuniao.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      mostRecent: sortedByDataRealizada[0],
      mostRecentRealized: sortedRealizedMeetings[0] || null,
      tipoReuniaoCount,
      statusCount,
      total: reuniaoData.length,
      lastMeetingDate: sortedByDataRealizada[0] ? new Date(sortedByDataRealizada[0].data_realizada).toLocaleDateString('pt-BR') : "0"
    };
  };

  const reuniaoOverview = processReuniaoData();
  const realizedCount = reuniaoOverview.statusCount['Realizado'] ?? 0;
  const pendingCount = reuniaoOverview.statusCount['Pendente'] ?? 0;
  const notApplicableCount = reuniaoOverview.statusCount['NA'] ?? 0;
  const realizationRate = reuniaoOverview.total > 0 ? Math.round((realizedCount / reuniaoOverview.total) * 100) : 0;
  const meetingTypeEntries = Object.entries(reuniaoOverview.tipoReuniaoCount);
  const statusEntries = Object.entries(reuniaoOverview.statusCount);
  const lastMeetingLabel = reuniaoOverview.lastMeetingDate !== '0' ? reuniaoOverview.lastMeetingDate : 'Sem registro';
  const meetingStatusPalette: Record<string, { color: string; background: string; border: string; icon: string }> = {
    Realizado: {
      color: '#1E3A8A',
      background: 'rgba(30, 58, 138, 0.12)',
      border: '1px solid rgba(30, 58, 138, 0.35)',
      icon: '✅',
    },
    Pendente: {
      color: '#2563EB',
      background: 'rgba(37, 99, 235, 0.12)',
      border: '1px solid rgba(37, 99, 235, 0.35)',
      icon: '🕒',
    },
    NA: {
      color: '#60A5FA',
      background: 'rgba(96, 165, 250, 0.18)',
      border: '1px solid rgba(96, 165, 250, 0.35)',
      icon: 'ℹ️',
    },
  };
  const getMeetingStatusPalette = (status: string) =>
    meetingStatusPalette[status] ?? {
      color: '#1E3A8A',
      background: 'rgba(37, 99, 235, 0.12)',
      border: '1px solid rgba(37, 99, 235, 0.35)',
      icon: 'ⓘ',
    };
  const statusSummaryBadges = [
    { label: 'Realizadas', value: realizedCount, ...meetingStatusPalette.Realizado },
    { label: 'Pendentes', value: pendingCount, ...meetingStatusPalette.Pendente },
    { label: 'Não Aplicáveis', value: notApplicableCount, ...meetingStatusPalette.NA },
  ];
  const getNpsChipStyles = (score: number) => {
    if (score >= 4) {
      return { backgroundColor: 'rgba(30, 58, 138, 0.16)', color: '#1E3A8A' };
    }
    if (score >= 3) {
      return { backgroundColor: 'rgba(37, 99, 235, 0.16)', color: '#2563EB' };
    }
    return { backgroundColor: 'rgba(147, 197, 253, 0.25)', color: '#1D4ED8' };
  };
  const metricChipStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 2,
    py: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  } as const;

  const signalMetricChipStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    px: 2,
    py: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  } as const;
  const signalStatusPalette: Record<string, { color: string; background: string; border: string; icon: string }> = {
    'Sinal Verde': {
      color: '#1E3A8A',
      background: 'rgba(30, 58, 138, 0.12)',
      border: '1px solid rgba(30, 58, 138, 0.35)',
      icon: '🔷',
    },
    'Sinal Amarelo': {
      color: '#2563EB',
      background: 'rgba(37, 99, 235, 0.12)',
      border: '1px solid rgba(37, 99, 235, 0.35)',
      icon: '🔵',
    },
    'Sinal Vermelho': {
      color: '#60A5FA',
      background: 'rgba(96, 165, 250, 0.18)',
      border: '1px solid rgba(96, 165, 250, 0.35)',
      icon: '🔹',
    },
  };
  const getSignalPalette = (status: string) =>
    signalStatusPalette[status] ?? {
      color: '#1E3A8A',
      background: 'rgba(37, 99, 235, 0.12)',
      border: '1px solid rgba(37, 99, 235, 0.35)',
      icon: '🔹',
    };

  // Function to process Ferramentas data
  const processFerramentasData = () => {
    if (ferramentasData.length === 0) {
      return {
        total: 0,
        firstToolDate: "0",
        lastUpdateDate: "0"
      };
    }

    const creationDates = ferramentasData.map(f => new Date(f.data_criacao).getTime());
    const updateDates = ferramentasData.map(f => new Date(f.data_alteracao).getTime());

    return {
      total: ferramentasData.length,
      firstToolDate: new Date(Math.min(...creationDates)).toLocaleDateString('pt-BR'),
      lastUpdateDate: new Date(Math.max(...updateDates)).toLocaleDateString('pt-BR')
    };
  };

  // Function to process Sinal Amarelo data
  const processSinalAmareloData = () => {
    if (sinalAmareloData.length === 0) {
      return {
        mostRecent: null,
        statusCount: {} as Record<string, number>,
        total: 0,
        lastSignalDate: "0"
      };
    }

    // Sort by data_criacao to get the most recent
    const sortedByDataCriacao = sinalAmareloData.sort((a, b) => 
      new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    );

    // Count status occurrences
    const statusCount = sinalAmareloData.reduce((acc, sinal) => {
      const status = sinal.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      mostRecent: sortedByDataCriacao[0],
      statusCount,
      total: sinalAmareloData.length,
      lastSignalDate: sortedByDataCriacao[0] ? new Date(sortedByDataCriacao[0].data_criacao).toLocaleDateString('pt-BR') : "0"
    };
  };

  const sinalOverview = processSinalAmareloData();
  const lastSignalLabel = sinalOverview.lastSignalDate !== '0' ? sinalOverview.lastSignalDate : 'Sem registro';
  const latestSignal = sinalOverview.mostRecent;
  const signalStatusEntries = Object.entries(sinalOverview.statusCount);
  const signalSummaryBadges = ['Sinal Verde', 'Sinal Amarelo', 'Sinal Vermelho'].map((status) => ({
    label: status.replace('Sinal ', ''),
    value: sinalOverview.statusCount[status] ?? 0,
    ...getSignalPalette(status),
  }));

  // Function to process Socios data
  const processSociosData = () => {
    if (sociosData.length === 0) {
      return {
        total: 0,
        averageAge: 0,
        formacoes: {} as Record<string, number>,
        discProfiles: {} as Record<string, number>,
        sedirpProfiles: {} as Record<string, number>,
        eneagramaProfiles: {} as Record<string, number>,
        meiOptedIn: 0,
        meiOptedOut: 0
      };
    }

    // Calculate average age
    const totalAge = sociosData.reduce((sum, socio) => sum + socio.idade, 0);
    const averageAge = Math.round(totalAge / sociosData.length);

    // Count formações
    const formacoes = sociosData.reduce((acc, socio) => {
      const formacao = socio.formacao;
      acc[formacao] = (acc[formacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count DISC profiles
    const discProfiles = sociosData.reduce((acc, socio) => {
      const disc = socio.disc;
      acc[disc] = (acc[disc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count SEDIRP profiles
    const sedirpProfiles = sociosData.reduce((acc, socio) => {
      const sedirp = socio.sedirp;
      acc[sedirp] = (acc[sedirp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count Eneagrama profiles
    const eneagramaProfiles = sociosData.reduce((acc, socio) => {
      const eneagrama = socio.eneagrama;
      acc[eneagrama] = (acc[eneagrama] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count MEI options
    const meiOptedIn = sociosData.filter(socio => socio.opcao_pelo_mei).length;
    const meiOptedOut = sociosData.filter(socio => !socio.opcao_pelo_mei).length;

    return {
      total: sociosData.length,
      averageAge,
      formacoes,
      discProfiles,
      sedirpProfiles,
      eneagramaProfiles,
      meiOptedIn,
      meiOptedOut
    };
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box
          component="button"
          onClick={() => navigate(-1)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#1E3A8A',
            color: 'white',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            px: 2,
            py: 1,
            transition: 'all 0.3s ease',
            mr: 3,
            '&:hover': {
              backgroundColor: '#1D4ED8',
            },
          }}
        >
          <ArrowBack />
          Voltar
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
          Relatório do Cliente
        </Typography>
      </Box>

      {/* Show error if exists */}
      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Show DRE error if exists */}
      {dreError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {dreError}
        </Alert>
      )}

      {/* Show Fotografia error if exists */}
      {fotografiaError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {fotografiaError}
        </Alert>
      )}

      {/* Show Dores error if exists */}
      {doresError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {doresError}
        </Alert>
      )}

      {/* Show Ferramentas error if exists */}
      {ferramentasError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {ferramentasError}
        </Alert>
      )}

      {/* Show Reuniao error if exists */}
      {reuniaoError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {reuniaoError}
        </Alert>
      )}

      {/* Show Sinal Amarelo error if exists */}
      {sinalAmareloError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {sinalAmareloError}
        </Alert>
      )}

      {/* Show Socios error if exists */}
      {sociosError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {sociosError}
        </Alert>
      )}

      {/* Show LTV error if exists */}
      {ltvError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {ltvError}
        </Alert>
      )}

      {/* Company selection */}
      <FormControl fullWidth variant="outlined" sx={{ mb: 4 }}>
        <InputLabel id="select-empresa-label">Selecionar Empresa</InputLabel>
        <Select
          labelId="select-empresa-label"
          value={selectedCNPJ}
          onChange={handleEmpresaChange}
          label="Selecionar Empresa"
          disabled={loadingEmpresas}
        >
          {loadingEmpresas ? (
            <MenuItem disabled>
              <CircularProgress size={24} />
            </MenuItem>
          ) : (
            empresas.length > 0 ? (
              empresas.map((empresa) => (
                <MenuItem key={empresa.cnpj} value={empresa.cnpj}>
                  {empresa.razao_social}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                Nenhuma empresa encontrada
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>

      {/* Show selected company information */}
      {selectedCNPJ && selectedRazaoSocial ? (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8fbff 0%, #e0e7ff 100%)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{
              fontWeight: 'bold',
              color: '#1E3A8A',
              mb: 3,
            }}
          >
            Empresa Selecionada
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                  color: '#1E3A8A',
                  mb: 1,
                }}
              >
                CNPJ:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  fontSize: '1.1rem',
                  fontFamily: 'monospace',
                }}
              >
                {selectedCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                  color: '#1E3A8A',
                  mb: 1,
                }}
              >
                Razão Social:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  fontSize: '1.1rem',
                }}
              >
                {selectedRazaoSocial}
              </Typography>
            </Box>
          </Box>

          {/* LTV Section */}
          <Box sx={{ mt: 4, mb: 4 }}>
            {loadingLTV ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados LTV...
                </Typography>
              </Box>
            ) : ltvData ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #10B981', borderRadius: 2, background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' }}>
                  <Typography variant="body2" sx={{ color: '#059669', fontWeight: 'bold', mb: 1 }}>
                    LTV Total
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                    R$ {Number(ltvData.ltv).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #3B82F6', borderRadius: 2, background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)' }}>
                  <Typography variant="body2" sx={{ color: '#1D4ED8', fontWeight: 'bold', mb: 1 }}>
                    Fatura Mensal
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#3B82F6', fontWeight: 'bold' }}>
                    R$ {Number(ltvData.valor_fatura_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #F59E0B', borderRadius: 2, background: 'linear-gradient(135deg, #FFFBF0 0%, #FEF3C7 100%)' }}>
                  <Typography variant="body2" sx={{ color: '#D97706', fontWeight: 'bold', mb: 1 }}>
                    Data de Contratação
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>
                    {ltvData.data_contratacao}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #EC4899', borderRadius: 2, background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)' }}>
                  <Typography variant="body2" sx={{ color: '#BE185D', fontWeight: 'bold', mb: 1 }}>
                    Meses Ativo
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#EC4899', fontWeight: 'bold' }}>
                    {ltvData.meses_ativo} 📅
                  </Typography>
                </Paper>
              </Box>
            ) : (
              ltvError && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {ltvError}
                </Alert>
              )
            )}
          </Box>

          {/* DRE Data Table */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Highlights
            </Typography>

            {/* DRE Summary */}

            {loadingDRE ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados DRE...
                </Typography>
              </Box>
            ) : dreData.length > 0 ? (
              <>
                <TableContainer component={Paper} sx={{ maxHeight: 600, mb: 3 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white', minWidth: 100 }}>
                          Data
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white', minWidth: 200 }}>
                          Descrição
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white', minWidth: 120 }} align="right">
                          Valor (R$)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white', minWidth: 100 }} align="right">
                          An. Vertical (%)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white', minWidth: 100 }} align="right">
                          An. Horizontal (%)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white', minWidth: 120 }}>
                          Usuário
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dreData
                        .sort((a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime())
                        .map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(30, 64, 175, 0.1)',
                            },
                            backgroundColor: row.Valor > 0 ? 'rgba(30, 58, 138, 0.12)' : 'rgba(191, 219, 254, 0.3)',
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            {new Date(row.Data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {row.Descricao}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              color: row.Valor > 0 ? '#1E3A8A' : '#2563EB',
                            }}
                          >
                            R$ {row.Valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: row.AnaliseVertical > 0 ? 'bold' : 'normal'
                            }}
                          >
                            {row.AnaliseVertical}%
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: row.AnaliseHorizontal > 0 ? 'bold' : 'normal'
                            }}
                          >
                            {row.AnaliseHorizontal}%
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            <Box sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              backgroundColor: 'rgba(37, 99, 235, 0.12)',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: '#1E3A8A',
                            }}>
                              {row.Usuario}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

              </>
            ) : (
              <Alert severity="warning">
                Nenhum Highlight encontrado para esta empresa.
              </Alert>
            )}
          </Box>

          {/* DRE Analysis by Description */}
          {dreData.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#1E3A8A',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Análise Detalhada por Tipo de Descrição do Highlight
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                {Object.entries(processDREByDescription()).map(([description, data]) => (
                  <Paper
                    key={description}
                    elevation={3}
                    sx={{
                      p: 4,
                      border: data.allRecords.length > 0 ? '2px solid rgba(37, 99, 235, 0.35)' : '2px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: 3,
                      opacity: data.allRecords.length > 0 ? 1 : 0.6,
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, rgba(248, 251, 255, 0.95) 0%, rgba(226, 232, 240, 0.55) 100%)',
                      '&:hover': {
                        transform: data.allRecords.length > 0 ? 'translateY(-4px)' : 'none',
                        boxShadow: data.allRecords.length > 0 ? '0 8px 25px rgba(37, 99, 235, 0.2)' : 'none',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#1E3A8A',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          flex: 1
                        }}
                      >
                        {description}
                      </Typography>
                      {data.allRecords.length > 0 && (
                        <Box
                          sx={{
                            backgroundColor: 'rgba(37, 99, 235, 0.14)',
                            color: '#1E3A8A',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(37, 99, 235, 0.35)',
                          }}
                        >
                          {data.allRecords.length} registros
                        </Box>
                      )}
                    </Box>

                    {data.allRecords.length > 0 ? (
                      <>
                        {/* Detalhes de Registros */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                          {/* Primeiro registro */}
                          <Box sx={{ p: 2, backgroundColor: 'rgba(248, 251, 255, 0.92)', borderRadius: 2, border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                              📅 Primeiro Registro
                            </Typography>
                            {data.oldest && (
                              <>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Data:</strong> {new Date(data.oldest.Data).toLocaleDateString('pt-BR')}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Valor:</strong> R$ {data.oldest.Valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>An. Vertical:</strong> {data.oldest.AnaliseVertical}%
                                </Typography>
                                <Typography variant="body2">
                                  <strong>An. Horizontal:</strong> {data.oldest.AnaliseHorizontal}%
                                </Typography>
                              </>
                            )}
                          </Box>

                          {/* Mês anterior */}
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: 'rgba(248, 251, 255, 0.92)',
                              borderRadius: 2,
                              border: data.previousToNewest ? '1px solid rgba(96, 165, 250, 0.45)' : '1px solid rgba(148, 163, 184, 0.25)',
                              opacity: data.previousToNewest ? 1 : 0.6,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2563EB', mb: 1 }}>
                              📊 Mês Anterior
                            </Typography>
                            {data.previousToNewest ? (
                              <>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Data:</strong> {new Date(data.previousToNewest.Data).toLocaleDateString('pt-BR')}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Valor:</strong> R$ {data.previousToNewest.Valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>An. Vertical:</strong> {data.previousToNewest.AnaliseVertical}%
                                </Typography>
                                <Typography variant="body2">
                                  <strong>An. Horizontal:</strong> {data.previousToNewest.AnaliseHorizontal}%
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                                Não há registro anterior
                              </Typography>
                            )}
                          </Box>

                          {/* Mês atual */}
                          <Box sx={{ p: 2, backgroundColor: 'rgba(248, 251, 255, 0.92)', borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.35)' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1D4ED8', mb: 1 }}>
                              🆕 Mês Atual
                            </Typography>
                            {data.newest && (
                              <>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Data:</strong> {new Date(data.newest.Data).toLocaleDateString('pt-BR')}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Valor:</strong> R$ {data.newest.Valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>An. Vertical:</strong> {data.newest.AnaliseVertical}%
                                </Typography>
                                <Typography variant="body2">
                                  <strong>An. Horizontal:</strong> {data.newest.AnaliseHorizontal}%
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>

                        {/* Trending indicator */}
                        {data.oldest && data.newest && data.oldest.id !== data.newest.id && (
                          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(226, 232, 240, 0.6)', borderRadius: 1, border: '1px dashed rgba(37, 99, 235, 0.3)' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
                              📈 Evolução:{' '}
                              <span
                                style={{
                                  color:
                                    data.newest.Valor > data.oldest.Valor
                                      ? '#1E40AF'
                                      : data.newest.Valor < data.oldest.Valor
                                      ? '#2563EB'
                                      : '#1E3A8A',
                                }}
                              >
                                {data.newest.Valor > data.oldest.Valor ? '↗️ Crescimento' : data.newest.Valor < data.oldest.Valor ? '↘️ Redução' : '➡️ Estável'}
                              </span>
                              {' '}de R$ {Math.abs(data.newest.Valor - data.oldest.Valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                        Nenhum registro encontrado para esta descrição
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Fotografia Data Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Dados de Fotografia do Cliente
            </Typography>

            {loadingFotografia ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados de Fotografia...
                </Typography>
              </Box>
            ) : fotografiaData.length > 0 ? (
              <>
                {/* Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processFotografiaByDate().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Fotografias
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold' }}>
                      {processFotografiaByDate().firstPhotoDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primeira Fotografia
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(147, 197, 253, 0.45)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processFotografiaByDate().lastPhotoDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última Fotografia
                    </Typography>
                  </Paper>
                </Box>

                {/* Detailed Comparison */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {/* Fotografia Mais Antiga */}
                  {processFotografiaByDate().oldest && (
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid rgba(37, 99, 235, 0.35)', backgroundColor: 'rgba(248, 251, 255, 0.9)' }}>
                      <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                        📅 Fotografia Mais Antiga
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Criada em: {new Date(processFotografiaByDate().oldest!.data_criacao).toLocaleDateString('pt-BR')}
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Usuário:</strong> {processFotografiaByDate().oldest!.usuario}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Fotografia Inicial:</strong> {processFotografiaByDate().oldest!.fotografia_inicial ? 'Sim' : 'Não'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                        Dados Financeiros:
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Faturamento:</strong> {processFotografiaByDate().oldest!.faturamento}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Margem Lucro:</strong> {processFotografiaByDate().oldest!.margem_lucro}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Pro Labore:</strong> R$ {processFotografiaByDate().oldest!.pro_labore.toLocaleString('pt-BR')}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Parcelas Mensais:</strong> R$ {processFotografiaByDate().oldest!.parcelas_mensais.toLocaleString('pt-BR')}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                        Dados Operacionais:
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>Nº Funcionários:</strong> {processFotografiaByDate().oldest!.numero_funcionarios}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Nº Clientes:</strong> {processFotografiaByDate().oldest!.numero_clientes}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Estrutura:</strong> {processFotografiaByDate().oldest!.estrutura}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Cultura Empresarial:</strong> {processFotografiaByDate().oldest!.cultura_empresarial}
                        </Typography>
                      </Box>
                    </Paper>
                  )}

                  {/* Fotografia Mais Recente */}
                  {processFotografiaByDate().newest && (
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid rgba(96, 165, 250, 0.45)', backgroundColor: 'rgba(248, 251, 255, 0.9)' }}>
                      <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold', mb: 2 }}>
                        🆕 Fotografia Mais Recente
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Criada em: {new Date(processFotografiaByDate().newest!.data_criacao).toLocaleDateString('pt-BR')}
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Usuário:</strong> {processFotografiaByDate().newest!.usuario}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Fotografia Inicial:</strong> {processFotografiaByDate().newest!.fotografia_inicial ? 'Sim' : 'Não'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                        Dados Financeiros:
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Faturamento:</strong> {processFotografiaByDate().newest!.faturamento}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Margem Lucro:</strong> {processFotografiaByDate().newest!.margem_lucro}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Pro Labore:</strong> R$ {processFotografiaByDate().newest!.pro_labore.toLocaleString('pt-BR')}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Parcelas Mensais:</strong> R$ {processFotografiaByDate().newest!.parcelas_mensais.toLocaleString('pt-BR')}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                        Dados Operacionais:
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>Nº Funcionários:</strong> {processFotografiaByDate().newest!.numero_funcionarios}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Nº Clientes:</strong> {processFotografiaByDate().newest!.numero_clientes}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Estrutura:</strong> {processFotografiaByDate().newest!.estrutura}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Cultura Empresarial:</strong> {processFotografiaByDate().newest!.cultura_empresarial}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Box>

                {/* Evolution Summary */}
                {processFotografiaByDate().oldest && processFotografiaByDate().newest && 
                 processFotografiaByDate().oldest!.id !== processFotografiaByDate().newest!.id && (
                  <Box sx={{ mt: 3 }}>
                    <Paper sx={{ p: 3, backgroundColor: 'rgba(248, 251, 255, 0.92)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                      <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                        📊 Evolução da Empresa
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
                            Pro Labore:
                          </Typography>
                          <Typography variant="body2">
                            {processFotografiaByDate().newest!.pro_labore > processFotografiaByDate().oldest!.pro_labore ? '↗️' : 
                             processFotografiaByDate().newest!.pro_labore < processFotografiaByDate().oldest!.pro_labore ? '↘️' : '➡️'}
                            {' '}R$ {Math.abs(processFotografiaByDate().newest!.pro_labore - processFotografiaByDate().oldest!.pro_labore).toLocaleString('pt-BR')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2563EB' }}>
                            Parcelas Mensais:
                          </Typography>
                          <Typography variant="body2">
                            {processFotografiaByDate().newest!.parcelas_mensais > processFotografiaByDate().oldest!.parcelas_mensais ? '↗️' : 
                             processFotografiaByDate().newest!.parcelas_mensais < processFotografiaByDate().oldest!.parcelas_mensais ? '↘️' : '➡️'}
                            {' '}R$ {Math.abs(processFotografiaByDate().newest!.parcelas_mensais - processFotografiaByDate().oldest!.parcelas_mensais).toLocaleString('pt-BR')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1D4ED8' }}>
                            Período:
                          </Typography>
                          <Typography variant="body2">
                            {Math.ceil((new Date(processFotografiaByDate().newest!.data_criacao).getTime() - 
                                      new Date(processFotografiaByDate().oldest!.data_criacao).getTime()) / (1000 * 60 * 60 * 24))} dias
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="warning">
                Nenhum dado de Fotografia encontrado para esta empresa.
              </Alert>
            )}
          </Box>

          {/* Dores Data Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Análise de Dores do Cliente
            </Typography>

            {loadingDores ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados de Dores...
                </Typography>
              </Box>
            ) : doresData.length > 0 ? (
              <>
                {/* Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processDoresByDate().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Avaliações
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold' }}>
                      {processDoresByDate().firstEvaluationDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primeira Avaliação
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(147, 197, 253, 0.45)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processDoresByDate().lastEvaluationDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última Avaliação
                    </Typography>
                  </Paper>
                </Box>

                {/* Detailed Comparison */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {/* Avaliação Mais Antiga */}
                  {processDoresByDate().oldest && (
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid rgba(59, 130, 246, 0.35)', backgroundColor: 'rgba(248, 251, 255, 0.9)' }}>
                      <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                        📅 Avaliação Mais Antiga
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Criada em: {new Date(processDoresByDate().oldest!.data_criacao).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Consultor:</strong> {processDoresByDate().oldest!.consultor}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#1E3A8A' }}>
                        🏢 Dores Organizacionais (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                          <Typography variant="body2">Ausência de Salário</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_salario}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Centralização de Decisões</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.centralizacao_decisoes}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Ausência de Planejamento</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_planejamento}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Ausência de Estratégia</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_estrategia}</Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#1E3A8A' }}>
                        💰 Dores Financeiras (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                          <Typography variant="body2">Desconhec. Lucratividade</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.desconhecimento_lucratividade}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Preços Informais</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.precos_informal}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Ausência de Capital</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_capital}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Utilização Linhas Crédito</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.utilizacao_linhas_credito}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )}

                  {/* Avaliação Mais Recente */}
                  {processDoresByDate().newest && (
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid rgba(96, 165, 250, 0.45)', backgroundColor: 'rgba(248, 251, 255, 0.9)' }}>
                      <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold', mb: 2 }}>
                        🆕 Avaliação Mais Recente
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Criada em: {new Date(processDoresByDate().newest!.data_criacao).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Consultor:</strong> {processDoresByDate().newest!.consultor}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#1E3A8A' }}>
                        🏢 Dores Organizacionais (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                          <Typography variant="body2">Ausência de Salário</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_salario}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Centralização de Decisões</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.centralizacao_decisoes}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Ausência de Planejamento</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_planejamento}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Ausência de Estratégia</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_estrategia}</Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#1E3A8A' }}>
                        💰 Dores Financeiras (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                          <Typography variant="body2">Desconhec. Lucratividade</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.desconhecimento_lucratividade}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Preços Informais</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.precos_informal}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Ausência de Capital</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_capital}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'rgba(248, 251, 255, 0.85)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.08)' }}>
                          <Typography variant="body2">Utilização Linhas Crédito</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.utilizacao_linhas_credito}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </>
            ) : (
              <Alert severity="warning">
                Nenhum dado de Dores encontrado para esta empresa.
              </Alert>
            )}
          </Box>

          {/* Ferramentas Data Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              🔧 Ferramentas Desenvolvidas para o Cliente
            </Typography>

            {loadingFerramentas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados de Ferramentas...
                </Typography>
              </Box>
            ) : ferramentasData.length > 0 ? (
              <>
                {/* Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processFerramentasData().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Ferramentas
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold' }}>
                      {processFerramentasData().firstToolDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primeira Ferramenta
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(147, 197, 253, 0.45)', borderRadius: 2, backgroundColor: 'rgba(248, 251, 255, 0.85)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processFerramentasData().lastUpdateDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última Atualização
                    </Typography>
                  </Paper>
                </Box>

                {/* Ferramentas Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {ferramentasData
                    .sort((a, b) => new Date(b.data_alteracao).getTime() - new Date(a.data_alteracao).getTime())
                    .map((ferramenta) => (
                    <Paper
                      key={ferramenta.id}
                      elevation={3}
                      sx={{
                        p: 3,
                        border: '2px solid rgba(37, 99, 235, 0.35)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, rgba(248, 251, 255, 0.95) 0%, rgba(226, 232, 240, 0.6) 100%)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.2)',
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#1E3A8A',
                          fontWeight: 'bold',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        🔧 {ferramenta.nome_ferramenta}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          mb: 3,
                          fontStyle: 'italic',
                          backgroundColor: 'rgba(248, 251, 255, 0.85)',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                        }}
                      >
                        {ferramenta.descricao}
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>ID:</strong> #{ferramenta.id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Criado por:</strong> {ferramenta.usuario_criacao}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>📅 Criação:</strong> {new Date(ferramenta.data_criacao).toLocaleDateString('pt-BR')} às {new Date(ferramenta.data_criacao).toLocaleTimeString('pt-BR')}
                        </Typography>
                        <Typography variant="body2">
                          <strong>🔄 Última Alteração:</strong> {new Date(ferramenta.data_alteracao).toLocaleDateString('pt-BR')} às {new Date(ferramenta.data_alteracao).toLocaleTimeString('pt-BR')}
                        </Typography>
                      </Box>

                      {ferramenta.url && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                            🌐 URL de Acesso:
                          </Typography>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(37, 99, 235, 0.08)',
                            borderRadius: 2,
                            border: '1px solid rgba(37, 99, 235, 0.25)',
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#1E3A8A',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                              }}
                            >
                              <a 
                                href={ferramenta.url.startsWith('http') ? ferramenta.url : `https://${ferramenta.url}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  color: '#1E3A8A', 
                                  textDecoration: 'none'
                                }}
                              >
                                {ferramenta.url}
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {ferramenta.diretorio && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                            📁 Diretório:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(248, 251, 255, 0.85)',
                              p: 1,
                              borderRadius: 1,
                              border: '1px solid rgba(148, 163, 184, 0.25)'
                            }}
                          >
                            {ferramenta.diretorio}
                          </Typography>
                        </Box>
                      )}

                      {ferramenta.tipo && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1E3A8A' }}>
                            🏷️ Tipo:
                          </Typography>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              backgroundColor: 'rgba(59, 130, 246, 0.16)',
                              borderRadius: 2,
                              border: '1px solid rgba(59, 130, 246, 0.35)',
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ color: '#1E3A8A', fontWeight: 'bold' }}
                            >
                              {ferramenta.tipo}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              </>
            ) : (
              <Alert severity="warning">
                Nenhuma ferramenta desenvolvida encontrada para esta empresa.
              </Alert>
            )}
          </Box>

          {/* Reuniões Data Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              🤝 Reuniões Realizadas com o Cliente
            </Typography>

            {loadingReuniao ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados de Reuniões...
                </Typography>
              </Box>
            ) : reuniaoData.length > 0 ? (
              <>
                {/* Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', backgroundColor: 'rgba(37, 99, 235, 0.04)' }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {reuniaoOverview.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Reuniões
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', backgroundColor: 'rgba(37, 99, 235, 0.04)' }}>
                    <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold' }}>
                      {lastMeetingLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última Reunião
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', backgroundColor: 'rgba(37, 99, 235, 0.04)' }}>
                    <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 'bold' }}>
                      {meetingTypeEntries.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de Reunião
                    </Typography>
                  </Paper>
                </Box>

                {/* Most Recent Realized Meeting */}
                {reuniaoOverview.mostRecentRealized && (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      border: '2px solid rgba(30, 58, 138, 0.35)',
                      mb: 4,
                      backgroundColor: 'rgba(248, 251, 255, 0.95)',
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                      ✅ Reunião Mais Recente
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>Data Realizada:</strong> {new Date(reuniaoOverview.mostRecentRealized!.data_realizada).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>Usuário:</strong> {reuniaoOverview.mostRecentRealized!.user}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>Tipo de Reunião:</strong> {reuniaoOverview.mostRecentRealized!.tipo_reuniao}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>Status:</strong>{' '}
                          {(() => {
                            const palette = getMeetingStatusPalette(reuniaoOverview.mostRecentRealized!.status);
                            return (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  px: 1.25,
                                  py: 0.5,
                                  borderRadius: 1,
                                  backgroundColor: palette.background,
                                  border: palette.border,
                                  color: palette.color,
                                  fontWeight: 'bold',
                                  fontSize: '0.8rem',
                                }}
                              >
                                <span>{palette.icon}</span>
                                <span>{reuniaoOverview.mostRecentRealized!.status}</span>
                              </Box>
                            );
                          })()}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>Local:</strong> {reuniaoOverview.mostRecentRealized!.local_reuniao}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>NPS da Reunião:</strong>{' '}
                          {(() => {
                            const npsChip = getNpsChipStyles(reuniaoOverview.mostRecentRealized!.nps_reuniao);
                            return (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1.25,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                  ...npsChip,
                                }}
                              >
                                {reuniaoOverview.mostRecentRealized!.nps_reuniao}/5
                              </Box>
                            );
                          })()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#1F2937' }}>
                          <strong>Ata da Reunião:</strong>{' '}
                          <Link
                            href={reuniaoOverview.mostRecentRealized!.Ata_reuniao}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#2563EB', fontWeight: 'bold' }}
                          >
                            📄 Ver Ata Completa
                          </Link>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1F2937' }}>
                          <strong>Criada em:</strong> {new Date(reuniaoOverview.mostRecentRealized!.data_criacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Additional info for realized meeting */}
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        borderRadius: 2,
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                        📊 Detalhes da Realização:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                          🎯 Reunião efetivamente realizada
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                          📅 Data: {new Date(reuniaoOverview.mostRecentRealized!.data_realizada).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                          ⭐ Avaliação: {reuniaoOverview.mostRecentRealized!.nps_reuniao >= 4 ? 'Excelente' :
                                        reuniaoOverview.mostRecentRealized!.nps_reuniao >= 3 ? 'Boa' : 'Precisa melhorar'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* No realized meetings message */}
                {!reuniaoOverview.mostRecentRealized && reuniaoOverview.total > 0 && (
                  <Paper
                    elevation={3}
                    sx={{ p: 3, border: '2px solid rgba(37, 99, 235, 0.35)', mb: 4, backgroundColor: 'rgba(248, 251, 255, 0.9)' }}
                  >
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                      ⏳ Nenhuma Reunião Realizada
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                      Todas as reuniões estão com status "Pendente" ou "Não Aplicável". Ainda não há reuniões efetivamente realizadas para este cliente.
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        borderRadius: 1,
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
                        💡 Dica: Atualize o status das reuniões para "Realizado" após sua conclusão para aparecerem nesta seção.
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Meeting breakdown summary */}
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    background: 'linear-gradient(135deg, #f8fbff 0%, #eef2ff 100%)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                        📊 Panorama de Reuniões
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        Visão consolidada dos encontros por tipo, status e desempenho recente.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={metricChipStyles}>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          🗂️
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          {reuniaoOverview.total} no total
                        </Typography>
                      </Box>
                      <Box sx={{ ...metricChipStyles, backgroundColor: 'rgba(59, 130, 246, 0.16)', color: '#1D4ED8' }}>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          📈
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          {realizationRate}% de realização
                        </Typography>
                      </Box>
                      <Box sx={{ ...metricChipStyles, backgroundColor: 'rgba(191, 219, 254, 0.35)', color: '#1E3A8A' }}>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          📅
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          Última: {lastMeetingLabel}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box
                      sx={{
                        flex: '1 1 320px',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderRadius: 2,
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        p: 3,
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#2563EB', fontWeight: 'bold', mb: 2 }}>
                        Tipos de reunião
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 1.5 }}>
                        {meetingTypeEntries.length > 0 ? (
                          meetingTypeEntries.map(([tipo, count]) => (
                            <Box
                              key={tipo}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 2,
                                py: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                                border: '1px solid rgba(37, 99, 235, 0.2)',
                              }}
                            >
                              <Typography variant="body1" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                                {tipo}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                                {count} {count === 1 ? 'reunião' : 'reuniões'}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ color: '#475569' }}>
                            Ainda não há reuniões categorizadas.
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        flex: '1 1 320px',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderRadius: 2,
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        p: 3,
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                        Status das reuniões
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 1.5 }}>
                        {statusEntries.length > 0 ? (
                          statusEntries.map(([status, count]) => {
                            const palette = getMeetingStatusPalette(status);
                            return (
                              <Box
                                key={status}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 2,
                                  backgroundColor: palette.background,
                                  border: palette.border,
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 'bold', color: palette.color, display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <span>{palette.icon}</span>
                                  <span>{status === 'NA' ? 'Não Aplicável' : status}</span>
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: palette.color }}>
                                  {count} {count === 1 ? 'reunião' : 'reuniões'}
                                </Typography>
                              </Box>
                            );
                          })
                        ) : (
                          <Typography variant="body2" sx={{ color: '#475569' }}>
                            Nenhum status registrado até o momento.
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          mt: 3,
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        {statusSummaryBadges.map((badge) => (
                          <Box
                            key={badge.label}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 2,
                              backgroundColor: badge.background,
                              border: badge.border,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography variant="body2" sx={{ color: badge.color, fontWeight: 'bold' }}>
                              {badge.icon} {badge.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: badge.color, fontWeight: 'bold' }}>
                              {badge.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'rgba(30, 58, 138, 0.08)',
                          border: '1px dashed rgba(30, 58, 138, 0.2)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                          📈 Taxa de realização
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#1E3A8A', fontWeight: 'bold', mt: 0.5 }}>
                          {realizationRate}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </>
            ) : (
              <Alert severity="warning">
                Nenhuma reunião encontrada para esta empresa.
              </Alert>
            )}
          </Box>

          {/* Sinal Amarelo Data Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              🚦 Dados de Sinal Amarelo do Cliente
            </Typography>

            {loadingSinalAmarelo ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados de Sinal Amarelo...
                </Typography>
              </Box>
            ) : sinalAmareloData.length > 0 ? (
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  background: 'linear-gradient(135deg, #f8fbff 0%, #eef2ff 100%)',
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid rgba(37, 99, 235, 0.35)',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {sinalOverview.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Registros
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid rgba(37, 99, 235, 0.35)',
                      backgroundColor: 'rgba(37, 99, 235, 0.06)',
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {lastSignalLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Último Registro
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#1D4ED8', fontWeight: 'bold' }}>
                      {signalStatusEntries.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de Status
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                        🚦 Panorama de Sinais
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        Monitoramento consolidado dos alertas por status e responsáveis.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={signalMetricChipStyles}>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          📊
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          {sinalOverview.total} registros
                        </Typography>
                      </Box>
                      <Box sx={{ ...signalMetricChipStyles, backgroundColor: 'rgba(59, 130, 246, 0.16)', color: '#1E3A8A' }}>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          🧭
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          {signalStatusEntries.length} status ativos
                        </Typography>
                      </Box>
                      <Box sx={{ ...signalMetricChipStyles, backgroundColor: 'rgba(147, 197, 253, 0.2)', color: '#1D4ED8' }}>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          📅
                        </Typography>
                        <Typography component="span" sx={{ fontWeight: 'inherit' }}>
                          Último: {lastSignalLabel}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box
                      sx={{
                        flex: '1 1 320px',
                        backgroundColor: 'rgba(248, 250, 255, 0.95)',
                        borderRadius: 2,
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        p: 3,
                        minHeight: 220,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                        Sinal mais recente
                      </Typography>
                      {latestSignal ? (
                        <Box sx={{ display: 'grid', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                              ID: #{latestSignal.id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#1D4ED8' }}>
                              Registrado em {new Date(latestSignal.data_criacao).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#1E293B' }}>
                              <strong>Usuário:</strong> {latestSignal.usuario}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#1E293B' }}>
                              <strong>Status:</strong>
                            </Typography>
                            {(() => {
                              const palette = getSignalPalette(latestSignal.status);
                              return (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 2,
                                    backgroundColor: palette.background,
                                    border: palette.border,
                                    fontWeight: 'bold',
                                    color: palette.color,
                                  }}
                                >
                                  <span>{palette.icon}</span>
                                  <span>{latestSignal.status}</span>
                                </Box>
                              );
                            })()}
                            <Typography variant="body2" sx={{ color: '#1E293B' }}>
                              <strong>Motivo:</strong> {latestSignal.motivoSinal || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                          Nenhum sinal registrado recentemente.
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        flex: '1 1 320px',
                        backgroundColor: 'rgba(248, 250, 255, 0.95)',
                        borderRadius: 2,
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        p: 3,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                        Distribuição por status
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 1.5 }}>
                        {signalStatusEntries.length > 0 ? (
                          signalStatusEntries.map(([status, count]) => {
                            const palette = getSignalPalette(status);
                            return (
                              <Box
                                key={status}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 2,
                                  backgroundColor: palette.background,
                                  border: palette.border,
                                }}
                              >
                                <Typography variant="body1" sx={{ color: palette.color, fontWeight: 'bold' }}>
                                  {palette.icon} {status}
                                </Typography>
                                <Typography variant="body2" sx={{ color: palette.color, fontWeight: 'bold' }}>
                                  {count}
                                </Typography>
                              </Box>
                            );
                          })
                        ) : (
                          <Typography variant="body2" sx={{ color: '#64748B' }}>
                            Nenhum status cadastrado até o momento.
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          mt: 3,
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                          gap: 1.5,
                        }}
                      >
                        {signalSummaryBadges.map((badge) => (
                          <Box
                            key={badge.label}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 2,
                              backgroundColor: badge.background,
                              border: badge.border,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="body2" sx={{ color: badge.color, fontWeight: 'bold' }}>
                              {badge.icon} {badge.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: badge.color, fontWeight: 'bold' }}>
                              {badge.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'rgba(30, 58, 138, 0.08)',
                          border: '1px dashed rgba(30, 58, 138, 0.2)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                          🔎 Monitoramento contínuo
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1E3A8A' }}>
                          Atualize os status sempre que um acompanhamento for concluído.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
                    📋 Histórico Completo de Sinais
                  </Typography>
                  <TableContainer
                    sx={{
                      maxHeight: 400,
                      borderRadius: 2,
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white' }}>
                            ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white' }}>
                            Data
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white' }}>
                            Usuário
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white' }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1E3A8A', color: 'white' }}>
                            Motivo
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sinalAmareloData
                          .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
                          .map((sinal) => (
                          <TableRow 
                            key={sinal.id} 
                            hover 
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(30, 64, 175, 0.08)'
                              },
                              backgroundColor: getSignalPalette(sinal.status).background,
                            }}
                          >
                            <TableCell sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                              #{sinal.id}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              {new Date(sinal.data_criacao).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              <Box sx={{
                                display: 'inline-block',
                                px: 2,
                                py: 0.5,
                                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: '#1E3A8A',
                              }}>
                                {sinal.usuario}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              {(() => {
                                const palette = getSignalPalette(sinal.status);
                                return (
                                  <Box sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 2,
                                    py: 0.5,
                                    backgroundColor: palette.background,
                                    color: palette.color,
                                    borderRadius: 2,
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    border: palette.border,
                                  }}>
                                    <span>{palette.icon}</span>
                                    <span>{sinal.status}</span>
                                  </Box>
                                );
                              })()}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              {sinal.motivoSinal}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            ) : (
              <Alert severity="warning">
                Nenhum dado de Sinal Amarelo encontrado para esta empresa.
              </Alert>
            )}
          </Box>

          {/* Socios Data Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1E3A8A',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              👥 Dados dos Sócios da Empresa
            </Typography>

            {loadingSocios ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando dados dos Sócios...
                </Typography>
              </Box>
            ) : sociosData.length > 0 ? (
              <>
                {/* Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(37, 99, 235, 0.35)', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {processSociosData().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Sócios
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#1D4ED8', fontWeight: 'bold' }}>
                      {processSociosData().averageAge} anos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Idade Média
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(96, 165, 250, 0.35)', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 'bold' }}>
                      {processSociosData().meiOptedIn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optaram pelo MEI
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(147, 197, 253, 0.45)', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {Object.keys(processSociosData().formacoes).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de Formação
                    </Typography>
                  </Paper>
                </Box>

                {/* Detailed Socios Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                  {sociosData.map((socio) => (
                    <Paper
                      key={socio.id}
                      elevation={3}
                      sx={{
                        p: 3,
                        border: '2px solid rgba(37, 99, 235, 0.35)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #f8fbff 0%, #eef2ff 100%)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.25)',
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#1E3A8A',
                          fontWeight: 'bold',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        👤 {socio.nome_socio}
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>ID:</strong> #{socio.id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Idade:</strong> {socio.idade} anos
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>CPF:</strong> {socio.cnpj_cpf_do_socio.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </Typography>
                        <Typography variant="body2">
                          <strong>📅 Nascimento:</strong> {new Date(socio.data_nascimento).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2">
                          <strong>🤝 Entrada na Sociedade:</strong> {new Date(socio.data_entrada_sociedade).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 3 }}>
                        <Typography variant="body2">
                          <strong>🎓 Formação:</strong> {socio.formacao}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#1E3A8A' }}>
                          📊 Análise de Perfil Comportamental:
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(37, 99, 235, 0.12)',
                            borderRadius: 2,
                            border: '1px solid rgba(37, 99, 235, 0.35)',
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                              🔄 Metodologia DISC:
                            </Typography>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 2,
                              py: 0.5,
                              backgroundColor: 'rgba(30, 64, 175, 0.16)',
                              color: '#ffffff',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              letterSpacing: '0.03em',
                            }}>
                              {socio.disc}
                            </Box>
                          </Box>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                              📊 Metodologia SEDIRP:
                            </Typography>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 2,
                              py: 0.5,
                              backgroundColor: 'rgba(30, 64, 175, 0.2)',
                              color: '#ffffff',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}>
                              {socio.sedirp}
                            </Box>
                          </Box>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(191, 219, 254, 0.35)',
                            borderRadius: 2,
                            border: '1px solid rgba(147, 197, 253, 0.45)',
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                              🎯 Metodologia Eneagrama:
                            </Typography>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 2,
                              py: 0.5,
                              backgroundColor: 'rgba(30, 58, 138, 0.24)',
                              color: '#ffffff',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}>
                              Tipo {socio.eneagrama}
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          🎮 Hobbies e Interesses:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontStyle: 'italic',
                            backgroundColor: 'rgba(248, 251, 255, 0.85)',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid rgba(148, 163, 184, 0.3)'
                          }}
                        >
                          {socio.hobbies}
                        </Typography>
                      </Box>

                      {socio.relatorio_prospeccao && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            📋 Relatório Comportamental:
                          </Typography>
                          <Box sx={{
                            p: 2,
                            backgroundColor: 'rgba(37, 99, 235, 0.08)',
                            borderRadius: 2,
                            border: '1px solid rgba(37, 99, 235, 0.25)',
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#1E3A8A',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                              }}
                            >
                              <a 
                                href={socio.relatorio_prospeccao.startsWith('http') ? socio.relatorio_prospeccao : `https://${socio.relatorio_prospeccao}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  color: '#1E3A8A', 
                                  textDecoration: 'none'
                                }}
                              >
                                {socio.relatorio_prospeccao}
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          💼 Opção pelo MEI:
                        </Typography>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 2,
                          py: 0.5,
                          backgroundColor: socio.opcao_pelo_mei ? 'rgba(30, 58, 138, 0.85)' : 'rgba(191, 219, 254, 0.6)',
                          color: socio.opcao_pelo_mei ? '#ffffff' : '#1E3A8A',
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          border: '1px solid rgba(37, 99, 235, 0.35)',
                        }}>
                          {socio.opcao_pelo_mei ? '✔ SIM' : '✖ NÃO'}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </>
            ) : (
              <Alert severity="warning">
                Nenhum dado de Sócios encontrado para esta empresa.
              </Alert>
            )}
          </Box>

        </Paper>
      ) : (
        <Paper
          elevation={1}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: 'rgba(248, 251, 255, 0.85)',
            border: '2px dashed rgba(37, 99, 235, 0.25)',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1E3A8A',
              mb: 2
            }}
          >
            Selecione uma empresa
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#475569'
            }}
          >
            Escolha uma empresa da lista acima para visualizar seus dados de relatório
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default RelatorioCliente;