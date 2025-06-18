//incluir checkbox para prospecção

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import SearchIcon from '@mui/icons-material/Search'; // Import the SearchIcon
import './Cadastro.css'; // Import the CSS file for styling
import { getAccessToken } from '../../utils/storage'; // Import the function to get the access token

type ClienteData = {
  id_icone?: string;
  razao_social: string;
  [key: string]: any; // Allow additional properties

};

const Cadastro = () => {
  // const [showWarningForm, setShowWarningForm] = useState(false);
  const [allData, setAllData] = useState<ClienteData[]>([]); // Use the defined type for allData
  const [searchTerm, setSearchTerm] = useState(''); // State for search input




  const [formData, setFormData] = useState({
    uf: '',
    cep: '',
    cnpj: '',
    pais: '',
    email: '',
    porte: '',
    bairro: '',
    numero: '',
    municipio: '',
    logradouro: '',
    cnae_fiscal: 0,
    complemento: '',
    razao_social: '',
    nome_fantasia: '',
    capital_social: 0,
    ddd_telefone_1: '',
    ddd_telefone_2: '',
    natureza_juridica: '',
    opcao_pelo_simples: false,
    cnae_fiscal_descricao: '',
    data_situacao_cadastral: null,
    descricao_situacao_cadastral: '',
    descricao_identificador_matriz_filial: '',

    numero_funcionarios: 0,

    ponto_apoio: '',
    perfil: '',
    area_atuacao: '',
    segmento: '',
    numero_reunioes: 0,
    status: '',
    data_contratacao_fast: null,
    data_saida_fast: null,
    nome_ponte: '',
    consultor_comercial: '',
    consultor_financeiro: '',
    analista: '',
    sinal: '',
    motivo_sinal: '',
    analista_responsável_sinal: '',
    parceiro: false,
    justificativa_parceria: '',
    status_parceria: '',
    resultados_parceria: '',
    descricao_avaliacao_parceria: '',
    prospeccao: false,
    responsavel_prospeccao: '',
    temperatura: '',
    data_previsao_fechamento: null,
    data_retorno: null,
    status_prospeccao: '',
    indicacao_cliente: false,
    quem_indicou: '',
    status_indicacao: '',
    nome_contato_indicacao: '',
    observacao_indicacao: '',
    SLA: '',
    data_sla: null,
    valor_fatura_cliente: 0,
    grupo_economico_cliente: '',
    coluna_mae: '',
    data_inicio_parceria: null,
    padrinho_parceria: '',
    avaliacao_parceria: '',
    cliente_fast: false,
    id_contrato: 0,
    id_icone: 0,
    comercial: '',
    cnae_secundario: null,
  });


  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja`, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`, // Add bearer token
          },
        });
        setAllData(response.data); // Store all objects
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term); // Update the search term
    const foundItem = allData.find((item) =>
      item.razao_social.toLowerCase().includes(term.toLowerCase())
    );
    if (foundItem) {
      const validKeys = Object.keys(formData); // Get valid keys from formData
      const filteredItem = Object.keys(foundItem)
        .filter((key) => validKeys.includes(key)) // Only include keys that exist in formData
        .reduce((obj, key) => {
          obj[key] = foundItem[key];
          return obj;
        }, {} as any);
      setFormData({ ...formData, ...filteredItem }); // Update form values

      // Fetch contratos for the found client
      try {
        
      } catch (error) {
        console.error('Erro ao buscar contratos:', error);
        alert('Erro ao buscar contratos do cliente.');
      }
    } else {
      setFormData({ ...formData }); // Reset formData if no match
      // setContratos([]); // Limpa os contratos se nenhum cliente for encontrado
    }
  };

  const handleCnpjBlur = async () => {
    if (formData.cnpj) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${formData.cnpj}`);
        const data = response.data;

        // Atualiza os campos do formulário com os dados retornados
        setFormData({
          ...formData,
          razao_social: data.razao_social || '',
          nome_fantasia: data.nome_fantasia || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || '',
          cep: data.cep || '',
          complemento: data.complemento || '',
          natureza_juridica: data.natureza_juridica || '',
          capital_social: data.capital_social || 0,
          cnae_fiscal: data.cnae_fiscal || 0,
          cnae_fiscal_descricao: data.cnae_fiscal_descricao || '',
          pais: data.pais || '',
          ddd_telefone_1: data.ddd_telefone_1 || '',
          ddd_telefone_2: data.ddd_telefone_2 || '',
          email: data.email || '',
          porte: data.porte || '',
          opcao_pelo_simples: data.opcao_pelo_simples || false,
          descricao_situacao_cadastral: data.descricao_situacao_cadastral || '',
          descricao_identificador_matriz_filial: data.descricao_identificador_matriz_filial || '',
        });
      } catch (error) {
        console.error('Erro ao buscar dados do CNPJ:', error);
        alert('Erro ao buscar dados do CNPJ. Verifique o número digitado.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'date' && value === ''
          ? null // Envia null para campos de data vazios
          : type === 'number'
            ? Number(value)
            : value,
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();

    try {
      const payload = {
        ...formData,
        data_criacao: new Date().toISOString(),
        data_alteracao: new Date().toISOString(),
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/loja`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Cadastro realizado com sucesso!');
      console.log('Response:', response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        alert('Cliente já cadastrado');
      } else {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao realizar o cadastro. Verifique os dados e tente novamente.');
      }
    }
  };

  const handleNew = () => {
    setFormData({
      uf: '',
      cep: '',
      cnpj: '',
      pais: '',
      email: '',
      porte: '',
      bairro: '',
      numero: '',
      municipio: '',
      logradouro: '',
      cnae_fiscal: 0,
      complemento: '',
      razao_social: '',
      nome_fantasia: '',
      capital_social: 0,
      ddd_telefone_1: '',
      ddd_telefone_2: '',
      natureza_juridica: '',
      opcao_pelo_simples: false,
      cnae_fiscal_descricao: '',
      data_situacao_cadastral: null,
      descricao_situacao_cadastral: '',
      descricao_identificador_matriz_filial: '',

      numero_funcionarios: 0,

      ponto_apoio: '',
      perfil: '',
      area_atuacao: '',
      segmento: '',
      numero_reunioes: 0,
      status: '',
      data_contratacao_fast: null,
      data_saida_fast: null,
      nome_ponte: '',
      consultor_comercial: '',
      consultor_financeiro: '',
      analista: '',
      sinal: '',
      motivo_sinal: '',
      analista_responsável_sinal: '',
      parceiro: false,
      justificativa_parceria: '',
      status_parceria: '',
      resultados_parceria: '',
      descricao_avaliacao_parceria: '',
      prospeccao: false,
      responsavel_prospeccao: '',
      temperatura: '',
      data_previsao_fechamento: null,
      data_retorno: null,
      status_prospeccao: '',
      indicacao_cliente: false,
      quem_indicou: '',
      status_indicacao: '',
      nome_contato_indicacao: '',
      observacao_indicacao: '',
      SLA: '',
      data_sla: null,
      valor_fatura_cliente: 0,
      grupo_economico_cliente: '',
      coluna_mae: '',
      data_inicio_parceria: null,
      padrinho_parceria: '',
      avaliacao_parceria: '',
      cliente_fast: false,
      id_contrato: 0,
      id_icone: 0,
      comercial: '',
      cnae_secundario: null,
    })
  };

  // const handleEmitirAlerta = async () => {
  //   if (!formData.cnpj) {
  //     alert('Nenhum cliente selecionado para emitir alerta.');
  //     return;
  //   }

  //   const token = getAccessToken();

  //   try {
  //     const response = await axios.patch(
  //       `${process.env.REACT_APP_API_URL}/loja/update/${formData.cnpj}`,
  //       formData, // Envia os dados atualizados do cliente
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     alert('Alerta emitido com sucesso!');
  //     console.log('Response:', response.data);
  //   } catch (error) {
  //     console.error('Erro ao emitir alerta:', error);
  //     alert('Erro ao emitir alerta. Verifique os dados e tente novamente.');
  //   }
  // };


  return (
    <form onSubmit={handleSubmit} className="cadastro-form">
      <div className="form-header">
        <button type="button" className="new-button" onClick={handleNew}>
          Novo
        </button>
      </div>
      <div className="search-bar">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder=  "Pesquisar por Razão Social..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)} // Trigger search on every input change
        />
      </div>

      {/* <div className="form-group warning-icon-container">
        <WarningIcon
          className="warning-icon"
          onClick={() => setShowWarningForm(!showWarningForm)} // Toggle the warning form
        />
      </div>
      {showWarningForm && (
        <div className="warning-form">
          <div className="form-group">
            <select
              name="sinal"
              value={formData.sinal}
              onChange={handleChange}
              className="select-input"
            >
              <option value="Sinal Verde">Sinal Verde</option>
              <option value="Sinal Amarelo">Sinal Amarelo</option>
              <option value="Sinal Vermelho">Sinal Vermelho</option>
            </select>
          </div>
          <div className="form-group motivo-sinal-container">
            <input
              name="motivo_sinal"
              value={formData.motivo_sinal}
              onChange={handleChange}
              placeholder="Motivo Sinal"
            />
            <div className="button-group">
              <button
                type="button"
                className="action-button"
                onClick={() => alert('Demanda do Analista acionada!')}
              >
                Demanda do Analista
              </button>
              <button
                type="button"
                className="action-button"
                onClick={() => alert('Overdelivery acionado!')}
              >
                Overdelivery
              </button>
            </div>
          </div>


          <div className="form-group">
            <input
              name="analista_responsável_sinal"
              value={formData.analista_responsável_sinal}
              onChange={handleChange}
              placeholder="Colaborador Responsável"
            />
          </div>




          <div className="form-group">
            <button
              type="button"
              className="alert-button"
              onClick={handleEmitirAlerta}
            >
              Emitir Alerta
            </button>
          </div>
        </div>
      )} */}



      <div className="form-row">
        <label className="checkbox-label">
          <input type="checkbox" name="cliente_fast" checked={formData.cliente_fast} onChange={handleChange} />
           Cliente Fast
        </label>
        <br/>
<div className="form-group">
  <label className="checkbox-label">
    <input type="checkbox" name="parceiro" checked={formData.parceiro} onChange={handleChange} />
    Parceiro Fast
  </label>
</div>
{formData.parceiro && (
  <>
    <div className="form-group">
      <label>Data Início Parceria:</label>
      <input
        type="date"
        name="data_inicio_parceria"
        value={formData.data_inicio_parceria || ''} // Converte null para string vazia
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Padrinho Parceria:</label>
      <input type="text" name="padrinho_parceria" value={formData.padrinho_parceria} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Justificativa Parceria:</label>
      <input type="text" name="justificativa_parceria" value={formData.justificativa_parceria} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Status Parceria:</label>
      <input type="text" name="status_parceria" value={formData.status_parceria} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Resultados Parceria:</label>
      <input type="text" name="resultados_parceria" value={formData.resultados_parceria} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Avaliação Parceria:</label>
      <input type="text" name="avaliacao_parceria" value={formData.avaliacao_parceria} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Descrição Avaliação Parceria:</label>
      <input type="text" name="descricao_avaliacao_parceria" value={formData.descricao_avaliacao_parceria} onChange={handleChange} />
    </div>
  </>
)}






<div className="form-group">
  <label className="checkbox-label">
    <input type="checkbox" name="prospeccao" checked={formData.prospeccao} onChange={handleChange} />
    Funil
  </label>
</div>
{formData.prospeccao && (
  <>
    <div className="form-group">
      <label>Responsável Prospecção:</label>
      <input type="text" name="responsavel_prospeccao" value={formData.responsavel_prospeccao} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Data da Previsão de Fechamento:</label>
      <input
        type="date"
        name="data_previsao_fechamento"
        value={formData.data_previsao_fechamento || ''} // Converte null para string vazia
        onChange={handleChange}
      />
    </div>
    <div className="form-group">
      <label>Data de Retorno:</label>
      <input
        type="date"
        name="data_retorno"
        value={formData.data_retorno || ''}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
            <select
              name="temperatura"
              value={formData.temperatura}
              onChange={handleChange}
              className="select-input"
            >
              <option value="" disabled>Temperatura do Lead</option>
              <option value="Quente">Quente</option>
              <option value="Frio">Frio</option>
            </select>
          </div>

          <div className="form-group">
            <select
              name="status_prospeccao"
              value={formData.status_prospeccao}
              onChange={handleChange}
              className="select-input"
            >
              <option value="" disabled>Status do Lead</option>
              <option value="sem perfil">Sem Perfil</option>
              <option value="proposta enviada">Proposta Enviada</option>
              <option value="em negociação">Em Negociação</option>
              <option value="contrato fechado">Contrato Fechado</option>
              <option value="não houve interesse">Não Houve Interesse</option>
              <option value="não é o momento">Não é o momento</option>
              <option value="Lead">Lead</option>

            </select>
          </div>
  </>
)}


<div className="form-group">
  <label className="checkbox-label">
    <input
      type="checkbox"
      name="indicacao_cliente"
      checked={formData.indicacao_cliente}
      onChange={handleChange}
    />
    Indicação Cliente
  </label>
</div>
{formData.indicacao_cliente && (
  <>
    <div className="form-group">
      <label>Quem Indicou:</label>
      <input type="text" name="quem_indicou" value={formData.quem_indicou} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Status Indicação:</label>
      <input type="text" name="status_indicacao" value={formData.status_indicacao} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Nome Contato Indicação:</label>
      <input type="text" name="nome_contato_indicacao" value={formData.nome_contato_indicacao} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Observação Indicação:</label>
      <input type="text" name="observacao_indicacao" value={formData.observacao_indicacao} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>SLA:</label>
      <input type="text" name="SLA" value={formData.SLA} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Data SLA:</label>
      <input
        type="date"
        name="data_sla"
        value={formData.data_sla || ''} // Converte null para string vazia
        onChange={handleChange}
      />
    </div>
  </>
)}




        <div className="form-group">
          <label>CNPJ:</label>
          <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} onBlur={handleCnpjBlur} />
        </div>
        <div className="form-group">
          <label>Consultor Comercial:</label>
          <input type="text" name="consultor_comercial" value={formData.consultor_comercial} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Consultor Financeiro:</label>
          <input type="text" name="consultor_financeiro" value={formData.consultor_financeiro} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Analista:</label>
          <input type="text" name="analista" value={formData.analista} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Número de Funcionários:</label>
          <input type="number" name="numero_funcionarios" value={formData.numero_funcionarios} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Ponto de Apoio:</label>
          <input type="text" name="ponto_apoio" value={formData.ponto_apoio} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Perfil:</label>
          <input type="text" name="perfil" value={formData.perfil} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Área de Atuação:</label>
          <input type="text" name="area_atuacao" value={formData.area_atuacao} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Segmento:</label>
          <input type="text" name="segmento" value={formData.segmento} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Número de Reuniões:</label>
          <input type="number" name="numero_reunioes" value={formData.numero_reunioes} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Status:</label>
          <input type="text" name="status" value={formData.status} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Data Contratação Fast:</label>
          <input
            type="date"
            name="data_contratacao_fast"
            value={formData.data_contratacao_fast || ''} // Converte null para string vazia
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Data Saída Fast:</label>
          <input
            type="date"
            name="data_saida_fast"
            value={formData.data_saida_fast || ''} // Converte null para string vazia
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Nome Ponte:</label>
          <input type="text" name="nome_ponte" value={formData.nome_ponte} onChange={handleChange} />
        </div>


        <div className="form-group">
          <label>Valor Fatura Cliente:</label>
          <input type="number" name="valor_fatura_cliente" value={formData.valor_fatura_cliente} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Grupo Econômico Cliente:</label>
          <input type="text" name="grupo_economico_cliente" value={formData.grupo_economico_cliente} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Coluna Mãe:</label>
          <input type="text" name="coluna_mae" value={formData.coluna_mae} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>UF:</label>
          <input type="text" name="uf" value={formData.uf} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>CEP:</label>
          <input type="text" name="cep" value={formData.cep} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Pais:</label>
          <input type="text" name="pais" value={formData.pais} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Porte:</label>
          <input type="text" name="porte" value={formData.porte} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Bairro:</label>
          <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Número:</label>
          <input type="text" name="numero" value={formData.numero} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Município:</label>
          <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Logradouro:</label>
          <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>CNAE Fiscal:</label>
          <input type="number" name="cnae_fiscal" value={formData.cnae_fiscal} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Complemento:</label>
          <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Razão Social:</label>
          <input type="text" name="razao_social" value={formData.razao_social} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Nome Fantasia:</label>
          <input type="text" name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Capital Social:</label>
          <input type="number" name="capital_social" value={formData.capital_social} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>DDD Telefone 1:</label>
          <input type="text" name="ddd_telefone_1" value={formData.ddd_telefone_1} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>DDD Telefone 2:</label>
          <input type="text" name="ddd_telefone_2" value={formData.ddd_telefone_2} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Natureza Jurídica:</label>
          <input type="text" name="natureza_juridica" value={formData.natureza_juridica} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Opção pelo Simples:</label>
          <input type="checkbox" name="opcao_pelo_simples" checked={formData.opcao_pelo_simples} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>CNAE Fiscal Descrição:</label>
          <input type="text" name="cnae_fiscal_descricao" value={formData.cnae_fiscal_descricao} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Descrição Situação Cadastral:</label>
          <input type="text" name="descricao_situacao_cadastral" value={formData.descricao_situacao_cadastral} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Descrição Identificador Matriz/Filial:</label>
          <input type="text" name="descricao_identificador_matriz_filial" value={formData.descricao_identificador_matriz_filial} onChange={handleChange} />
        </div>




      </div>



      

      {/* <div className="form-row">
        <h1 className="form-title">Contratos</h1>


        {contratos.length > 0 && (
          <><div className="contratos-section">
            <h2>Contratos</h2>
            {contratos.map((contrato) => (
              <button
                key={contrato.id}
                type="button"
                className="contrato-button"
                onClick={() => window.open(contrato.linkArquivo, '_blank')}
              >
                {contrato.nomeArquivo}
              </button>
            ))}
          </div>
            <button type="submit" className="submit-button">Cadastrar</button>
          </>
        )}
      </div> */}

      <div className="form-row">
        <button type="submit" className="submit-button">
          Cadastrar
        </button>
      </div>
    </form>
  );
};

export default Cadastro;