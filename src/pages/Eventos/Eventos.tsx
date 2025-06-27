import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'
import { getAccessToken } from '../../utils/storage'
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

const Eventos = () => {
  const [eventos, setEventos] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newEvento, setNewEvento] = useState<{
    id?: number
    nome_evento: string
    descricao: string
    local: string
    data_evento: string | null
    usuario: string
    status: string
  }>({
    nome_evento: '',
    descricao: '',
    local: '',
    data_evento: null,
    usuario: '',
    status: ''
  })

  useEffect(() => {
    const token = getAccessToken()
    axios.get(`${process.env.REACT_APP_API_URL}/tab-evento`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setEventos(response.data)
      })
      .catch(error => {
        console.error('Erro ao buscar eventos:', error)
      })
  }, [])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setIsEditing(false)
    setNewEvento({
      nome_evento: '',
      descricao: '',
      local: '',
      data_evento: null,
      usuario: '',
      status: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvento({ ...newEvento, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    const token = getAccessToken()
    
    if (isEditing) {
      // Atualizar evento existente
      axios.patch(`${process.env.REACT_APP_API_URL}/tab-evento/${newEvento.id}`, newEvento, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          setEventos(eventos.map(evento => 
            evento.id === newEvento.id ? response.data : evento
          ))
          handleClose()
        })
        .catch(error => {
          console.error('Erro ao atualizar evento:', error)
        })
    } else {
      // Criar novo evento
      axios.post(`${process.env.REACT_APP_API_URL}/tab-evento`, newEvento, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          setEventos([...eventos, response.data])
          handleClose()
        })
        .catch(error => {
          console.error('Erro ao adicionar evento:', error)
        })
    }
  }

  const handleEditEvento = (evento: any) => {
    setNewEvento({
      id: evento.id,
      nome_evento: evento.nome_evento,
      descricao: evento.descricao,
      local: evento.local,
      data_evento: evento.data_evento ? evento.data_evento.split('T')[0] : null, // Converter para formato de data
      usuario: evento.usuario,
      status: evento.status
    })
    setIsEditing(true)
    setOpen(true)
  }

  const columns = [
    { field: 'nome_evento', headerName: 'Nome do Evento', width: 200 },
    { field: 'descricao', headerName: 'Descrição', width: 300 },
    { field: 'local', headerName: 'Local', width: 200 },
    { field: 'data_evento', headerName: 'Data do Evento', width: 200 },
    { field: 'usuario', headerName: 'Usuário Responsável', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'data_criacao', headerName: 'Data de Criação', width: 200 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      renderCell: (params: any) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleEditEvento(params.row)}
          startIcon={<EditIcon />}
        >
        </Button>
      ),
    },
  ]


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Agenda de Eventos
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Adicionar Novo Evento
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Editar Evento' : 'Adicionar Novo Evento'}</DialogTitle>
        <DialogContent>
          <TextField 
            margin="dense" 
            name="nome_evento" 
            label="Nome do Evento" 
            fullWidth 
            value={newEvento.nome_evento}
            onChange={handleChange} 
          />
          <TextField 
            margin="dense" 
            name="descricao" 
            label="Descrição" 
            fullWidth 
            value={newEvento.descricao}
            onChange={handleChange} 
          />
          <TextField 
            margin="dense" 
            name="local" 
            label="Local" 
            fullWidth 
            value={newEvento.local}
            onChange={handleChange} 
          />
          <TextField
            margin="dense"
            name="data_evento"
            label="Data do Evento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newEvento.data_evento || ''}
            onChange={e => setNewEvento({ ...newEvento, data_evento: e.target.value })}
          />
          <TextField 
            margin="dense" 
            name="usuario" 
            label="Usuário Responsável" 
            fullWidth 
            value={newEvento.usuario}
            onChange={handleChange} 
          />
          <TextField 
            margin="dense" 
            name="status" 
            label="Status" 
            fullWidth 
            value={newEvento.status}
            onChange={handleChange} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEditing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
      <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
        <div style={{ height: 400, width: '80%', marginTop: 20 }}>
          <DataGrid rows={eventos} columns={columns} autoPageSize
          />
        </div>
      </Box>
    </Container>
  )
}

export default Eventos