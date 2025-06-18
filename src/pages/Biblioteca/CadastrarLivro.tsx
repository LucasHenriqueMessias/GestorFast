import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';

interface CadastrarLivroProps {
  onClose: () => void;
}

const CadastrarLivro: React.FC<CadastrarLivroProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !description) {
      alert('Preencha todos os campos e selecione um arquivo.');
      return;
    }
    setLoading(true);
    try {
      const token = getAccessToken();
      const usuario = getUsername() || '';
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('name', name);
      formDataToSend.append('description', description);
      formDataToSend.append('usuario', usuario);
      formDataToSend.append('tipo', 'Livro');

      await axios.post(`${process.env.REACT_APP_API_URL}/tab-upload/file`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Livro cadastrado com sucesso!');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      alert('Erro ao cadastrar livro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        margin="dense"
        label="Nome do Livro"
        fullWidth
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <TextField
        margin="dense"
        label="Descrição"
        fullWidth
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ margin: '16px 0' }}
        required
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar Livro'}
      </Button>
    </form>
  );
};

export default CadastrarLivro;
