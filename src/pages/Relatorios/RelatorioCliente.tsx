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

  // Helper function to safely get status count
  const getStatusCount = (status: string): number => {
    return processReuniaoData().statusCount[status] || 0;
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
          onClick={() => navigate('/Relatorios')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            backgroundColor: '#E91E63',
            color: 'white',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            mr: 3,
            '&:hover': {
              backgroundColor: '#C2185B',
            }
          }}
        >
          <ArrowBack />
          Voltar
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: '#E91E63',
              mb: 3
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
                  color: '#333',
                  mb: 1
                }}
              >
                CNPJ:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  fontSize: '1.1rem',
                  fontFamily: 'monospace'
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
                  color: '#333',
                  mb: 1
                }}
              >
                Razão Social:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  fontSize: '1.1rem'
                }}
              >
                {selectedRazaoSocial}
              </Typography>
            </Box>
          </Box>

          {/* DRE Data Table */}
          <Box sx={{ mt: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Highlights
            </Typography>

            {/* DRE Summary */}
            {dreData.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #4CAF50' }}>
                  <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {dreData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Registros
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                  <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                    R$ {dreData.reduce((sum, item) => sum + item.Valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                  <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {new Set(dreData.map(item => item.Descricao)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipos de Descrição
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #9C27B0' }}>
                  <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>
                    {dreData.filter(item => item.Valor > 0).length}/{dreData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receitas/Total
                  </Typography>
                </Paper>
              </Box>
            )}

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
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white', minWidth: 100 }}>
                          Data
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white', minWidth: 200 }}>
                          Descrição
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white', minWidth: 120 }} align="right">
                          Valor (R$)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white', minWidth: 100 }} align="right">
                          An. Vertical (%)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white', minWidth: 100 }} align="right">
                          An. Horizontal (%)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white', minWidth: 120 }}>
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
                              backgroundColor: 'rgba(233, 30, 99, 0.04)'
                            },
                            backgroundColor: row.Valor > 0 ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
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
                              color: row.Valor > 0 ? '#4CAF50' : '#F44336'
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
                              backgroundColor: 'rgba(233, 30, 99, 0.1)',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: '#E91E63'
                            }}>
                              {row.Usuario}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Resumo Financeiro DRE */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                    📊 Resumo dos Highlights
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Paper sx={{ p: 3, border: '1px solid #4CAF50', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ color: '#4CAF50', mb: 2, display: 'flex', alignItems: 'center' }}>
                        📈 Receitas Positivas
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                        R$ {dreData
                          .filter(item => item.Valor > 0)
                          .reduce((sum, item) => sum + item.Valor, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dreData.filter(item => item.Valor > 0).length} registros positivos
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 3, border: '1px solid #F44336', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ color: '#F44336', mb: 2, display: 'flex', alignItems: 'center' }}>
                        📉 Despesas/Custos
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F44336', mb: 1 }}>
                        R$ {Math.abs(dreData
                          .filter(item => item.Valor <= 0)
                          .reduce((sum, item) => sum + item.Valor, 0))
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dreData.filter(item => item.Valor <= 0).length} registros negativos
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
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
                  color: '#E91E63',
                  fontWeight: 'bold',
                  mb: 3
                }}
              >
                Análise Detalhada por Tipo de Descrição do Highlight
              </Typography>

              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  mb: 4,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  p: 2,
                  borderRadius: 2
                }}
              >
                Esta análise mostra a evolução temporal de cada tipo do Highlight, comparando os dados mais antigos com os mais recentes para identificar tendências financeiras.
              </Typography>

              {/* Summary Statistics */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #4CAF50', borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 1 }}>
                    {Object.values(processDREByDescription()).filter(data => data.allRecords.length > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Descrições com Dados
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Tipos ativos
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #FF9800', borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold', mb: 1 }}>
                    {Object.values(processDREByDescription()).filter(data => data.allRecords.length === 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Descrições sem Dados
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Tipos vazios
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #2196F3', borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold', mb: 1 }}>
                    {Object.values(processDREByDescription()).length > 0 ? Math.max(...Object.values(processDREByDescription()).map(data => data.allRecords.length)) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Máx. Registros por Tipo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Maior atividade
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #9C27B0', borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ color: '#9C27B0', fontWeight: 'bold', mb: 1 }}>
                    {Object.values(processDREByDescription()).reduce((acc, data) => acc + data.allRecords.length, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Total Geral
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Todos os registros
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                {Object.entries(processDREByDescription()).map(([description, data]) => (
                  <Paper 
                    key={description} 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      border: data.allRecords.length > 0 ? '2px solid #E91E63' : '2px solid #e0e0e0',
                      borderRadius: 3,
                      opacity: data.allRecords.length > 0 ? 1 : 0.6,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: data.allRecords.length > 0 ? 'translateY(-4px)' : 'none',
                        boxShadow: data.allRecords.length > 0 ? '0 8px 25px rgba(233, 30, 99, 0.15)' : 'none'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#E91E63',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          flex: 1
                        }}
                      >
                        {description}
                      </Typography>
                      {data.allRecords.length > 0 && (
                        <Box sx={{ 
                          backgroundColor: '#E91E63',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {data.allRecords.length} registros
                        </Box>
                      )}
                    </Box>

                    {data.allRecords.length > 0 ? (
                      <>
                        {/* Estatísticas Principais */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            borderRadius: 3,
                            border: '2px solid #E91E63',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #E91E63, #ad1457)'
                            }} />
                            <Typography variant="h3" sx={{ 
                              color: '#E91E63', 
                              fontWeight: 'bold',
                              mb: 1,
                              textShadow: '0 2px 4px rgba(233, 30, 99, 0.1)'
                            }}>
                              {data.allRecords.length}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#495057', 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              📊 Total de Registros
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            background: data.totalValue >= 0 
                              ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                              : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                            borderRadius: 3,
                            border: data.totalValue >= 0 ? '2px solid #4caf50' : '2px solid #f44336',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: data.totalValue >= 0 
                                ? 'linear-gradient(90deg, #4caf50, #2e7d32)'
                                : 'linear-gradient(90deg, #f44336, #c62828)'
                            }} />
                            <Typography variant="h4" sx={{ 
                              color: data.totalValue >= 0 ? '#2e7d32' : '#c62828', 
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              {data.totalValue.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#495057', 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              💰 Valor Total
                            </Typography>
                          </Box>

                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            borderRadius: 3,
                            border: '2px solid #9c27b0',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #9c27b0, #7b1fa2)'
                            }} />
                            <Typography variant="h4" sx={{ 
                              color: '#7b1fa2', 
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              {(data.totalValue / data.allRecords.length).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: '#495057', 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              📊 Média por Registro
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                          {/* Registro mais antigo */}
                          <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #4CAF50' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                              📅 Registro Mais Antigo
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

                          {/* Registro anterior ao mais novo */}
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: 2, 
                            border: data.previousToNewest ? '1px solid #FF9800' : '1px solid #e0e0e0',
                            opacity: data.previousToNewest ? 1 : 0.5
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800', mb: 1 }}>
                              📊 Registro Anterior ao Mais Novo
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
                              <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                                Não há registro anterior
                              </Typography>
                            )}
                          </Box>

                          {/* Registro mais novo */}
                          <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #2196F3' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1 }}>
                              🆕 Registro Mais Novo
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
                          <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                              📈 Evolução: {' '}
                              <span style={{ 
                                color: data.newest.Valor > data.oldest.Valor ? '#4CAF50' : 
                                      data.newest.Valor < data.oldest.Valor ? '#F44336' : '#FF9800' 
                              }}>
                                {data.newest.Valor > data.oldest.Valor ? '↗️ Crescimento' : 
                                 data.newest.Valor < data.oldest.Valor ? '↘️ Redução' : '➡️ Estável'}
                              </span>
                              {' '}de R$ {Math.abs(data.newest.Valor - data.oldest.Valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
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
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 3
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
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #4CAF50' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {processFotografiaByDate().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Fotografias
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {processFotografiaByDate().firstPhotoDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primeira Fotografia
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
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
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid #4CAF50' }}>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 2 }}>
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

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
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

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
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
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid #FF9800' }}>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold', mb: 2 }}>
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

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
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

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
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
                    <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
                        📊 Evolução da Empresa
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                            Pro Labore:
                          </Typography>
                          <Typography variant="body2">
                            {processFotografiaByDate().newest!.pro_labore > processFotografiaByDate().oldest!.pro_labore ? '↗️' : 
                             processFotografiaByDate().newest!.pro_labore < processFotografiaByDate().oldest!.pro_labore ? '↘️' : '➡️'}
                            {' '}R$ {Math.abs(processFotografiaByDate().newest!.pro_labore - processFotografiaByDate().oldest!.pro_labore).toLocaleString('pt-BR')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                            Parcelas Mensais:
                          </Typography>
                          <Typography variant="body2">
                            {processFotografiaByDate().newest!.parcelas_mensais > processFotografiaByDate().oldest!.parcelas_mensais ? '↗️' : 
                             processFotografiaByDate().newest!.parcelas_mensais < processFotografiaByDate().oldest!.parcelas_mensais ? '↘️' : '➡️'}
                            {' '}R$ {Math.abs(processFotografiaByDate().newest!.parcelas_mensais - processFotografiaByDate().oldest!.parcelas_mensais).toLocaleString('pt-BR')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
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
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 3
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
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #F44336' }}>
                    <Typography variant="h6" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                      {processDoresByDate().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Avaliações
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {processDoresByDate().firstEvaluationDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primeira Avaliação
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
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
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid #2196F3' }}>
                      <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold', mb: 2 }}>
                        📅 Avaliação Mais Antiga
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Criada em: {new Date(processDoresByDate().oldest!.data_criacao).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Consultor:</strong> {processDoresByDate().oldest!.consultor}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        🏢 Dores Organizacionais (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Salário</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_salario}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Centralização de Decisões</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.centralizacao_decisoes}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Planejamento</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_planejamento}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Estratégia</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_estrategia}</Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        💰 Dores Financeiras (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Desconhec. Lucratividade</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.desconhecimento_lucratividade}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Preços Informais</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.precos_informal}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Capital</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.ausencia_capital}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Utilização Linhas Crédito</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().oldest!.utilizacao_linhas_credito}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )}

                  {/* Avaliação Mais Recente */}
                  {processDoresByDate().newest && (
                    <Paper elevation={3} sx={{ p: 3, border: '2px solid #FF9800' }}>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold', mb: 2 }}>
                        🆕 Avaliação Mais Recente
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Criada em: {new Date(processDoresByDate().newest!.data_criacao).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Consultor:</strong> {processDoresByDate().newest!.consultor}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        🏢 Dores Organizacionais (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Salário</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_salario}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Centralização de Decisões</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.centralizacao_decisoes}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Planejamento</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_planejamento}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Estratégia</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_estrategia}</Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        💰 Dores Financeiras (1-5):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Desconhec. Lucratividade</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.desconhecimento_lucratividade}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Preços Informais</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.precos_informal}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2">Ausência de Capital</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{processDoresByDate().newest!.ausencia_capital}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
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
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 3
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
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #4CAF50' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {processFerramentasData().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Ferramentas
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {processFerramentasData().firstToolDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primeira Ferramenta
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
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
                        border: '2px solid #4CAF50',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)'
                        }
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#4CAF50',
                          fontWeight: 'bold',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        🔧 {ferramenta.nome_ferramenta}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          mb: 3,
                          fontStyle: 'italic',
                          backgroundColor: '#f8f9fa',
                          p: 2,
                          borderRadius: 1
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
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            🌐 URL de Acesso:
                          </Typography>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#e8f5e8', 
                            borderRadius: 2,
                            border: '1px solid #4CAF50'
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#2e7d32',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                              }}
                            >
                              <a 
                                href={ferramenta.url.startsWith('http') ? ferramenta.url : `https://${ferramenta.url}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  color: '#2e7d32', 
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
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            📁 Diretório:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              backgroundColor: '#f5f5f5',
                              p: 1,
                              borderRadius: 1
                            }}
                          >
                            {ferramenta.diretorio}
                          </Typography>
                        </Box>
                      )}

                      {ferramenta.tipo && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            🏷️ Tipo:
                          </Typography>
                          <Box sx={{ 
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: 2,
                            border: '1px solid #4CAF50'
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#2e7d32',
                                fontWeight: 'bold'
                              }}
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
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 3
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
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #4CAF50' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {processReuniaoData().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Reuniões
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {processReuniaoData().lastMeetingDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última Reunião
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                      {Object.keys(processReuniaoData().tipoReuniaoCount).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de Reunião
                    </Typography>
                  </Paper>
                </Box>

                {/* Most Recent Meeting */}
                {processReuniaoData().mostRecent && (
                  <Paper elevation={3} sx={{ p: 3, border: '2px solid #E91E63', mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#E91E63', fontWeight: 'bold', mb: 2 }}>
                      🆕 Reunião Mais Recente
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Data Realizada:</strong> {new Date(processReuniaoData().mostRecent!.data_realizada).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Usuário:</strong> {processReuniaoData().mostRecent!.user}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Tipo de Reunião:</strong> {processReuniaoData().mostRecent!.tipo_reuniao}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Status:</strong> {processReuniaoData().mostRecent!.status}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Local:</strong> {processReuniaoData().mostRecent!.local_reuniao}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>NPS da Reunião:</strong> {processReuniaoData().mostRecent!.nps_reuniao}/5
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Ata da Reunião:</strong>{' '}
                          <Link 
                            href={processReuniaoData().mostRecent!.Ata_reuniao} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ color: '#E91E63' }}
                          >
                            Ver Ata
                          </Link>
                        </Typography>
                        <Typography variant="body2">
                          <strong>Criada em:</strong> {new Date(processReuniaoData().mostRecent!.data_criacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* Most Recent Realized Meeting */}
                {processReuniaoData().mostRecentRealized && (
                  <Paper elevation={3} sx={{ p: 3, border: '2px solid #4CAF50', mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 2 }}>
                      ✅ Reunião Realizada Mais Recente
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Data Realizada:</strong> {new Date(processReuniaoData().mostRecentRealized!.data_realizada).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Usuário:</strong> {processReuniaoData().mostRecentRealized!.user}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Tipo de Reunião:</strong> {processReuniaoData().mostRecentRealized!.tipo_reuniao}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Status:</strong>{' '}
                          <Box 
                            component="span" 
                            sx={{ 
                              backgroundColor: '#4CAF50', 
                              color: 'white', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1, 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold' 
                            }}
                          >
                            {processReuniaoData().mostRecentRealized!.status}
                          </Box>
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Local:</strong> {processReuniaoData().mostRecentRealized!.local_reuniao}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>NPS da Reunião:</strong>{' '}
                          <Box 
                            component="span" 
                            sx={{ 
                              backgroundColor: processReuniaoData().mostRecentRealized!.nps_reuniao >= 4 ? '#4CAF50' : 
                                             processReuniaoData().mostRecentRealized!.nps_reuniao >= 3 ? '#FF9800' : '#F44336',
                              color: 'white', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1, 
                              fontSize: '0.875rem', 
                              fontWeight: 'bold' 
                            }}
                          >
                            {processReuniaoData().mostRecentRealized!.nps_reuniao}/5
                          </Box>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Ata da Reunião:</strong>{' '}
                          <Link 
                            href={processReuniaoData().mostRecentRealized!.Ata_reuniao} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ color: '#4CAF50', fontWeight: 'bold' }}
                          >
                            📄 Ver Ata Completa
                          </Link>
                        </Typography>
                        <Typography variant="body2">
                          <strong>Criada em:</strong> {new Date(processReuniaoData().mostRecentRealized!.data_criacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Additional info for realized meeting */}
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #4CAF50' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                        📊 Detalhes da Realização:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                          🎯 Reunião efetivamente realizada
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                          📅 Data: {new Date(processReuniaoData().mostRecentRealized!.data_realizada).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                          ⭐ Avaliação: {processReuniaoData().mostRecentRealized!.nps_reuniao >= 4 ? 'Excelente' : 
                                        processReuniaoData().mostRecentRealized!.nps_reuniao >= 3 ? 'Boa' : 'Precisa melhorar'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* No realized meetings message */}
                {!processReuniaoData().mostRecentRealized && processReuniaoData().total > 0 && (
                  <Paper elevation={3} sx={{ p: 3, border: '2px solid #FF9800', mb: 4, backgroundColor: '#fff8e1' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold', mb: 2 }}>
                      ⏳ Nenhuma Reunião Realizada
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f57c00' }}>
                      Todas as reuniões estão com status "Pendente" ou "Não Aplicável". Ainda não há reuniões efetivamente realizadas para este cliente.
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffcc02', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                        💡 Dica: Atualize o status das reuniões para "Realizado" após sua conclusão para aparecerem nesta seção.
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Meeting Types Count */}
                <Paper elevation={3} sx={{ p: 3, border: '2px solid #4CAF50' }}>
                  <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 3 }}>
                    📊 Contagem por Tipo de Reunião
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {Object.entries(processReuniaoData().tipoReuniaoCount).map(([tipo, count]) => (
                      <Box 
                        key={tipo}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 2, 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: 2,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {tipo}
                        </Typography>
                        <Box sx={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {count} reunião{count !== 1 ? 'ões' : ''}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Meeting Status Count */}
                <Paper elevation={3} sx={{ p: 3, border: '2px solid #FF9800' }}>
                  <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold', mb: 3 }}>
                    📋 Contagem por Status da Reunião
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {Object.entries(processReuniaoData().statusCount).map(([status, count]) => (
                      <Box 
                        key={status}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 2, 
                          backgroundColor: status === 'Realizado' ? '#e8f5e8' : 
                                          status === 'Pendente' ? '#fff3e0' : 
                                          status === 'NA' ? '#f3e5f5' : '#f8f9fa', 
                          borderRadius: 2,
                          border: status === 'Realizado' ? '1px solid #4CAF50' : 
                                 status === 'Pendente' ? '1px solid #FF9800' : 
                                 status === 'NA' ? '1px solid #9C27B0' : '1px solid #e0e0e0'
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: status === 'Realizado' ? '#2e7d32' : 
                                   status === 'Pendente' ? '#f57c00' : 
                                   status === 'NA' ? '#7b1fa2' : '#333'
                          }}
                        >
                          {status === 'NA' ? 'Não Aplicável' : status}
                        </Typography>
                        <Box sx={{
                          backgroundColor: status === 'Realizado' ? '#4CAF50' : 
                                          status === 'Pendente' ? '#FF9800' : 
                                          status === 'NA' ? '#9C27B0' : '#757575',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {count} reunião{count !== 1 ? 'ões' : ''}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Status Summary */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>
                      📊 Resumo de Status:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        ✅ Realizadas: {getStatusCount('Realizado')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#FF9800' }}>
                        ⏳ Pendentes: {getStatusCount('Pendente')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9C27B0' }}>
                        ❌ Não Aplicáveis: {getStatusCount('NA')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', fontWeight: 'bold' }}>
                        📈 Taxa de Realização: {processReuniaoData().total > 0 ? 
                          Math.round((getStatusCount('Realizado') / processReuniaoData().total) * 100) : 0}%
                      </Typography>
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
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 3
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
              <>
                {/* Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #4CAF50' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {processSinalAmareloData().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Registros
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {processSinalAmareloData().lastSignalDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Último Registro
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                      {Object.keys(processSinalAmareloData().statusCount).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tipos de Status
                    </Typography>
                  </Paper>
                </Box>

                {/* Most Recent Signal */}
                {processSinalAmareloData().mostRecent && (
                  <Paper elevation={3} sx={{ p: 3, border: '2px solid #4CAF50', mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 3 }}>
                      🚦 Sinal Mais Recente
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>ID:</strong> #{processSinalAmareloData().mostRecent!.id}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Usuário:</strong> {processSinalAmareloData().mostRecent!.usuario}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Data de Criação:</strong> {new Date(processSinalAmareloData().mostRecent!.data_criacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Status:</strong>
                        </Typography>
                        <Box sx={{ 
                          display: 'inline-block',
                          px: 3,
                          py: 1,
                          backgroundColor: processSinalAmareloData().mostRecent!.status === 'Sinal Verde' ? '#4CAF50' : 
                                             processSinalAmareloData().mostRecent!.status === 'Sinal Amarelo' ? '#FF9800' : '#F44336',
                          color: 'white',
                          borderRadius: 2,
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}>
                          {processSinalAmareloData().mostRecent!.status}
                        </Box>
                        
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          <strong>Motivo do Sinal:</strong> {processSinalAmareloData().mostRecent!.motivoSinal}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* Status Count */}
                <Paper elevation={3} sx={{ p: 3, border: '2px solid #4CAF50' }}>
                  <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 3 }}>
                    📊 Contagem por Status
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {Object.entries(processSinalAmareloData().statusCount).map(([status, count]) => (
                      <Box 
                        key={status}
                        sx={{ 
                          p: 2, 
                          border: '1px solid',
                          borderColor: status === 'Sinal Verde' ? '#4CAF50' : 
                                      status === 'Sinal Amarelo' ? '#FF9800' : '#F44336',
                          borderRadius: 2,
                          backgroundColor: status === 'Sinal Verde' ? 'rgba(76, 175, 80, 0.05)' : 
                                          status === 'Sinal Amarelo' ? 'rgba(255, 152, 0, 0.05)' : 'rgba(244, 67, 54, 0.05)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: status === 'Sinal Verde' ? '#4CAF50' : 
                                     status === 'Sinal Amarelo' ? '#FF9800' : '#F44336'
                            }}
                          >
                            {status === 'Sinal Verde' ? '🟢' : status === 'Sinal Amarelo' ? '🟡' : '🔴'} {status}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: status === 'Sinal Verde' ? '#4CAF50' : 
                                     status === 'Sinal Amarelo' ? '#FF9800' : '#F44336'
                            }}
                          >
                            {count}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Status Summary */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>
                      📊 Resumo de Sinais:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        🟢 Verde: {processSinalAmareloData().statusCount['Sinal Verde'] || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#FF9800' }}>
                        🟡 Amarelo: {processSinalAmareloData().statusCount['Sinal Amarelo'] || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#F44336' }}>
                        🔴 Vermelho: {processSinalAmareloData().statusCount['Sinal Vermelho'] || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* All Signals Table */}
                <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" sx={{ color: '#E91E63', fontWeight: 'bold', mb: 3 }}>
                    📋 Histórico Completo de Sinais
                  </Typography>
                  
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white' }}>
                            ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white' }}>
                            Data
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white' }}>
                            Usuário
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white' }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E91E63', color: 'white' }}>
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
                                backgroundColor: 'rgba(233, 30, 99, 0.04)'
                              },
                              backgroundColor: sinal.status === 'Sinal Verde' ? 'rgba(76, 175, 80, 0.05)' : 
                                              sinal.status === 'Sinal Amarelo' ? 'rgba(255, 152, 0, 0.05)' : 'rgba(244, 67, 54, 0.05)'
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
                                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: '#E91E63'
                              }}>
                                {sinal.usuario}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              <Box sx={{ 
                                display: 'inline-block',
                                px: 2,
                                py: 0.5,
                                backgroundColor: sinal.status === 'Sinal Verde' ? '#4CAF50' : 
                                                sinal.status === 'Sinal Amarelo' ? '#FF9800' : '#F44336',
                                color: 'white',
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}>
                                {sinal.status === 'Sinal Verde' ? '🟢' : sinal.status === 'Sinal Amarelo' ? '🟡' : '🔴'} {sinal.status}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem' }}>
                              {sinal.motivoSinal}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
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
                color: '#E91E63',
                fontWeight: 'bold',
                mb: 3
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
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #4CAF50' }}>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {processSociosData().total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Sócios
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #2196F3' }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                      {processSociosData().averageAge} anos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Idade Média
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #FF9800' }}>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                      {processSociosData().meiOptedIn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Optaram pelo MEI
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid #9C27B0' }}>
                    <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>
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
                        border: '2px solid #4CAF50',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)'
                        }
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#4CAF50',
                          fontWeight: 'bold',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
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

                      {/* Perfis Comportamentais */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: '#E91E63' }}>
                          📊 Análise de Perfil Comportamental:
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: 2,
                            border: '1px solid #2196F3'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                              🔄 Metodologia DISC:
                            </Typography>
                            <Box sx={{ 
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              backgroundColor: '#2196F3',
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {socio.disc}
                            </Box>
                          </Box>
                          
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#f3e5f5', 
                            borderRadius: 2,
                            border: '1px solid #9C27B0'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#7b1fa2', mb: 1 }}>
                              📊 Metodologia SEDIRP:
                            </Typography>
                            <Box sx={{ 
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              backgroundColor: '#9C27B0',
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {socio.sedirp}
                            </Box>
                          </Box>
                          
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#e8f5e8', 
                            borderRadius: 2,
                            border: '1px solid #4CAF50'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                              🎯 Metodologia Eneagrama:
                            </Typography>
                            <Box sx={{ 
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
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
                            backgroundColor: '#f8f9fa',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid #e9ecef'
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
                            backgroundColor: '#e8f5e8', 
                            borderRadius: 2,
                            border: '1px solid #4CAF50'
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#2e7d32',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                              }}
                            >
                              <a 
                                href={socio.relatorio_prospeccao.startsWith('http') ? socio.relatorio_prospeccao : `https://${socio.relatorio_prospeccao}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  color: '#2e7d32', 
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
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          backgroundColor: socio.opcao_pelo_mei ? '#4CAF50' : '#F44336',
                          color: 'white',
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {socio.opcao_pelo_mei ? '✅ SIM' : '❌ NÃO'}
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
            backgroundColor: '#fafafa',
            border: '2px dashed #e0e0e0'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#999',
              mb: 2
            }}
          >
            Selecione uma empresa
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666'
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