import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { getAccessToken } from '../../utils/storage';

interface SocioData {
  ID_Socio: number;
  cnpj_empresa: string;
  pais: null;
  nome_socio: string;
  codigo_pais: null;
  faixa_etaria: string;
  cnpj_cpf_do_socio: string;
  qualificacao_socio: string;
  codigo_faixa_etaria: number;
  data_entrada_sociedade: Date;
  identificador_de_socio: number;
  cpf_representante_legal: string;
  nome_representante_legal: string;
  codigo_qualificacao_socio: number;
  qualificacao_representante_legal: string;
  codigo_qualificacao_representante_legal: number;
  disc: string;
  serdip: string;
  eneagrama: string;
  hobbies: string;
  relatorio_prospeccao: string;
  opcao_pelo_mei: boolean;
}

const Socios = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSocio, setNewSocio] = useState<SocioData>({
    ID_Socio: 0,
    cnpj_empresa: '',
    pais: null,
    nome_socio: '',
    codigo_pais: null,
    faixa_etaria: '',
    cnpj_cpf_do_socio: '',
    qualificacao_socio: '',
    codigo_faixa_etaria: 0,
    data_entrada_sociedade: new Date(),
    identificador_de_socio: 0,
    cpf_representante_legal: '',
    nome_representante_legal: '',
    codigo_qualificacao_socio: 0,
    qualificacao_representante_legal: '',
    codigo_qualificacao_representante_legal: 0,
    disc: '',
    serdip: '',
    eneagrama: '',
    hobbies: '',
    relatorio_prospeccao: '',
    opcao_pelo_mei: false,
  });
  const [editSocio, setEditSocio] = useState<SocioData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = getAccessToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-socios`, config);
        const data = response.data.map((item: SocioData) => ({
          id: item.ID_Socio,
          ...item,
          data_entrada_sociedade: new Date(item.data_entrada_sociedade).toLocaleDateString(),
        }));
        setRows(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddSocio = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmitSocio = async () => {
    const token = getAccessToken();
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-socios`, newSocio, config);
      setRows([...rows, { id: response.data.ID_Socio, ...response.data }]);
      setShowForm(false);
      setNewSocio({
        ID_Socio: 0,
        cnpj_empresa: '',
        pais: null,
        nome_socio: '',
        codigo_pais: null,
        faixa_etaria: '',
        cnpj_cpf_do_socio: '',
        qualificacao_socio: '',
        codigo_faixa_etaria: 0,
        data_entrada_sociedade: new Date(),
        identificador_de_socio: 0,
        cpf_representante_legal: '',
        nome_representante_legal: '',
        codigo_qualificacao_socio: 0,
        qualificacao_representante_legal: '',
        codigo_qualificacao_representante_legal: 0,
        disc: '',
        serdip: '',
        eneagrama: '',
        hobbies: '',
        relatorio_prospeccao: '',
        opcao_pelo_mei: false,
      });
    } catch (error) {
      console.error('Erro ao cadastrar Sócio:', error);
    }
  };

//   const handleEditSocio = (index: number) => {
//     const socio = rows[index];
//     setEditSocio({
//       ID_Socio: socio.id,
//       cnpj_empresa: socio.cnpj_empresa,
//       pais: socio.pais,
//       nome_socio: socio.nome_socio,
//       codigo_pais: socio.codigo_pais,
//       faixa_etaria: socio.faixa_etaria,
//       cnpj_cpf_do_socio: socio.cnpj_cpf_do_socio,
//       qualificacao_socio: socio.qualificacao_socio,
//       codigo_faixa_etaria: socio.codigo_faixa_etaria,
//       data_entrada_sociedade: new Date(socio.data_entrada_sociedade),
//       identificador_de_socio: socio.identificador_de_socio,
//       cpf_representante_legal: socio.cpf_representante_legal,
//       nome_representante_legal: socio.nome_representante_legal,
//       codigo_qualificacao_socio: socio.codigo_qualificacao_socio,
//       qualificacao_representante_legal: socio.qualificacao_representante_legal,
//       codigo_qualificacao_representante_legal: socio.codigo_qualificacao_representante_legal,
//       disc: socio.disc,
//       serdip: socio.serdip,
//       eneagrama: socio.eneagrama,
//       hobbies: socio.hobbies,
//       relatorio_prospeccao: socio.relatorio_prospeccao,
//       opcao_pelo_mei: socio.opcao_pelo_mei,
//     });
//   };

  const handleSaveEditSocio = () => {
    if (editSocio) {
      const updatedQsa = rows.map((socio) => (socio.id === editSocio.ID_Socio ? editSocio : socio));
      setRows(updatedQsa);
      setEditSocio(null);
    }
  };

//   const handleChangeEditSocio = (field: string, value: string | number | boolean | null | Date) => {
//     if (editSocio) {
//       setEditSocio({ ...editSocio, [field]: value });
//     }
//   };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID Sócio', width: 90 },
    { field: 'cnpj_empresa', headerName: 'CNPJ Empresa', width: 150 },
    { field: 'pais', headerName: 'País', width: 150 },
    { field: 'nome_socio', headerName: 'Nome Sócio', width: 150 },
    { field: 'codigo_pais', headerName: 'Código País', width: 150 },
    { field: 'faixa_etaria', headerName: 'Faixa Etária', width: 150 },
    { field: 'cnpj_cpf_do_socio', headerName: 'CNPJ/CPF do Sócio', width: 150 },
    { field: 'qualificacao_socio', headerName: 'Qualificação Sócio', width: 150 },
    { field: 'codigo_faixa_etaria', headerName: 'Código Faixa Etária', width: 150 },
    { field: 'data_entrada_sociedade', headerName: 'Data Entrada Sociedade', width: 150 },
    { field: 'identificador_de_socio', headerName: 'Identificador de Sócio', width: 150 },
    { field: 'cpf_representante_legal', headerName: 'CPF Representante Legal', width: 150 },
    { field: 'nome_representante_legal', headerName: 'Nome Representante Legal', width: 150 },
    { field: 'codigo_qualificacao_socio', headerName: 'Código Qualificação Sócio', width: 150 },
    { field: 'qualificacao_representante_legal', headerName: 'Qualificação Representante Legal', width: 150 },
    { field: 'codigo_qualificacao_representante_legal', headerName: 'Código Qualificação Representante Legal', width: 150 },
    { field: 'disc', headerName: 'DISC', width: 150 },
    { field: 'serdip', headerName: 'SERDIP', width: 150 },
    { field: 'eneagrama', headerName: 'Eneagrama', width: 150 },
    { field: 'hobbies', headerName: 'Hobbies', width: 150 },
    { field: 'relatorio_prospeccao', headerName: 'Relatório Prospecção', width: 150 },
    { field: 'opcao_pelo_mei', headerName: 'Opção pelo MEI', width: 150 },
  ];
  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Sócios</h1>
      <Button variant="contained" color="primary" onClick={handleAddSocio} style={{ marginBottom: '16px' }}>
        Cadastrar Sócio
      </Button>
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>Cadastro de Sócio</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="CNPJ Empresa"
            type="text"
            fullWidth
            value={newSocio.cnpj_empresa}
            onChange={(e) => setNewSocio({ ...newSocio, cnpj_empresa: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Nome Sócio"
            type="text"
            fullWidth
            value={newSocio.nome_socio}
            onChange={(e) => setNewSocio({ ...newSocio, nome_socio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Faixa Etária"
            type="text"
            fullWidth
            value={newSocio.faixa_etaria}
            onChange={(e) => setNewSocio({ ...newSocio, faixa_etaria: e.target.value })}
          />
          <TextField
            margin="dense"
            label="CNPJ/CPF do Sócio"
            type="text"
            fullWidth
            value={newSocio.cnpj_cpf_do_socio}
            onChange={(e) => setNewSocio({ ...newSocio, cnpj_cpf_do_socio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Qualificação Sócio"
            type="text"
            fullWidth
            value={newSocio.qualificacao_socio}
            onChange={(e) => setNewSocio({ ...newSocio, qualificacao_socio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Código Faixa Etária"
            type="number"
            fullWidth
            value={newSocio.codigo_faixa_etaria}
            onChange={(e) => setNewSocio({ ...newSocio, codigo_faixa_etaria: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Data Entrada Sociedade"
            type="date"
            fullWidth
            value={newSocio.data_entrada_sociedade.toISOString().split('T')[0]}
            onChange={(e) => setNewSocio({ ...newSocio, data_entrada_sociedade: new Date(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Identificador de Sócio"
            type="number"
            fullWidth
            value={newSocio.identificador_de_socio}
            onChange={(e) => setNewSocio({ ...newSocio, identificador_de_socio: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="CPF Representante Legal"
            type="text"
            fullWidth
            value={newSocio.cpf_representante_legal}
            onChange={(e) => setNewSocio({ ...newSocio, cpf_representante_legal: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Nome Representante Legal"
            type="text"
            fullWidth
            value={newSocio.nome_representante_legal}
            onChange={(e) => setNewSocio({ ...newSocio, nome_representante_legal: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Código Qualificação Sócio"
            type="number"
            fullWidth
            value={newSocio.codigo_qualificacao_socio}
            onChange={(e) => setNewSocio({ ...newSocio, codigo_qualificacao_socio: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Qualificação Representante Legal"
            type="text"
            fullWidth
            value={newSocio.qualificacao_representante_legal}
            onChange={(e) => setNewSocio({ ...newSocio, qualificacao_representante_legal: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Código Qualificação Representante Legal"
            type="number"
            fullWidth
            value={newSocio.codigo_qualificacao_representante_legal}
            onChange={(e) => setNewSocio({ ...newSocio, codigo_qualificacao_representante_legal: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="DISC"
            type="text"
            fullWidth
            value={newSocio.disc}
            onChange={(e) => setNewSocio({ ...newSocio, disc: e.target.value })}
          />
          <TextField
            margin="dense"
            label="SERDIP"
            type="text"
            fullWidth
            value={newSocio.serdip}
            onChange={(e) => setNewSocio({ ...newSocio, serdip: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Eneagrama"
            type="text"
            fullWidth
            value={newSocio.eneagrama}
            onChange={(e) => setNewSocio({ ...newSocio, eneagrama: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Hobbies"
            type="text"
            fullWidth
            value={newSocio.hobbies}
            onChange={(e) => setNewSocio({ ...newSocio, hobbies: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Relatório Prospecção"
            type="text"
            fullWidth
            value={newSocio.relatorio_prospeccao}
            onChange={(e) => setNewSocio({ ...newSocio, relatorio_prospeccao: e.target.value })}
          />
          <label>Opção pelo MEI</label>
          <input
            type="checkbox"
            checked={newSocio.opcao_pelo_mei}
            onChange={(e) => setNewSocio({ ...newSocio, opcao_pelo_mei: e.target.checked })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmitSocio} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        rows={rows}
        columns={columns}
        autoPageSize={true}
        processRowUpdate={(newRow) => {
          handleSaveEditSocio();
          return newRow;
        }}
        getRowId={(row) => row.id}

      />
    </div>
  );
};

export default Socios;