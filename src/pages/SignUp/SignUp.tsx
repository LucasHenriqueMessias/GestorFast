import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import { Tabs, Tab } from '@mui/material';

interface User {
  id: number;
  user: string;
  password: string;
  active: boolean;
  role: string;
  department: string;
  nivel: number;
  data_inicio_fast: string | null;
  lider_educador: string;
  padrinho: string;
  analista: string | null;
}

interface NewUser {
  user: string;
  password: string;
  active: boolean;
  role: string;
  department: string;
  nivel: number;
  data_inicio_fast: string;
  lider_educador: string;
  padrinho: string;
  analista: string;
}

interface UpdateUser {
  active: boolean;
  role: string;
  department: string;
  nivel: number;
  data_inicio_fast: string;
  lider_educador: string;
  padrinho: string;
  analista: string;
}

const SignUp = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [newUser, setNewUser] = useState<NewUser>({
    user: '',
    password: '',
    active: true,
    role: 'user',
    department: 'Consultor',
    nivel: 0,
    data_inicio_fast: new Date().toISOString().split('T')[0],
    lider_educador: 'hygor.duarte',
    padrinho: 'hygor.duarte',
    analista: '',
  });

  const [resetPassword, setResetPassword] = useState({
    username: '',
    newPassword: '',
  });

  const [editUser, setEditUser] = useState<UpdateUser>({
    active: true,
    role: 'user',
    department: 'Consultor',
    nivel: 0,
    data_inicio_fast: new Date().toISOString().split('T')[0],
    lider_educador: 'hygor.duarte',
    padrinho: 'hygor.duarte',
    analista: '',
  });

  const [editingUsername, setEditingUsername] = useState<string>('');

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${apiUrl}/login`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar usuários',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = getAccessToken();
      const userData = {
        ...newUser,
        data_inicio_fast: newUser.data_inicio_fast ? new Date(newUser.data_inicio_fast).toISOString() : null,
        analista: newUser.analista || null,
      };

      await axios.post(`${apiUrl}/login`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSnackbar({
        open: true,
        message: 'Usuário criado com sucesso!',
        severity: 'success'
      });
      
      setOpenNewUserDialog(false);
      setNewUser({
        user: '',
        password: '',
        active: true,
        role: 'user',
        department: 'Consultor',
        nivel: 0,
        data_inicio_fast: new Date().toISOString().split('T')[0],
        lider_educador: 'hygor.duarte',
        padrinho: 'hygor.duarte',
        analista: '',
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar usuário',
        severity: 'error'
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      const token = getAccessToken();
      await axios.patch(
        `${apiUrl}/login/reset-password/${resetPassword.username}`,
        { username: resetPassword.username, newPassword: resetPassword.newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Senha redefinida com sucesso!',
        severity: 'success'
      });
      
      setOpenResetPasswordDialog(false);
      setResetPassword({ username: '', newPassword: '' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao redefinir senha',
        severity: 'error'
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = getAccessToken();
      const userData = {
        ...editUser,
        data_inicio_fast: editUser.data_inicio_fast ? new Date(editUser.data_inicio_fast).toISOString() : null,
        analista: editUser.analista || null,
      };

      await axios.patch(
        `${apiUrl}/login/update/${editingUsername}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Usuário atualizado com sucesso!',
        severity: 'success'
      });
      
      setOpenEditUserDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar usuário',
        severity: 'error'
      });
    }
  };

  const handleDeactivateUser = async (username: string) => {
    try {
      const token = getAccessToken();
      await axios.patch(
        `${apiUrl}/login/update/${username}`,
        {
          active: false,
          department: 'Unemployed',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Usuário desativado com sucesso!',
        severity: 'success'
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao desativar usuário',
        severity: 'error'
      });
    }
  };

  const handleActivateUser = async (username: string, previousDepartment: string) => {
    try {
      const token = getAccessToken();
      // Se o departamento for Unemployed, definir como Consultor por padrão
      const department = previousDepartment === 'Unemployed' ? 'Consultor' : previousDepartment;
      
      await axios.patch(
        `${apiUrl}/login/update/${username}`,
        {
          active: true,
          department: department,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Usuário ativado com sucesso!',
        severity: 'success'
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao ativar usuário',
        severity: 'error'
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUsername(user.user);
    setEditUser({
      active: user.active,
      role: user.role,
      department: user.department,
      nivel: user.nivel,
      data_inicio_fast: user.data_inicio_fast ? new Date(user.data_inicio_fast).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lider_educador: user.lider_educador,
      padrinho: user.padrinho,
      analista: user.analista || '',
    });
    setOpenEditUserDialog(true);
  };

  const openResetDialog = (username: string) => {
    setResetPassword({ username, newPassword: '' });
    setOpenResetPasswordDialog(true);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'user', headerName: 'Usuário', width: 180 },
    {
      field: 'department',
      headerName: 'Departamento',
      width: 150,
    },
    {
      field: 'role',
      headerName: 'Função',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === 'developer' ? 'Dev' : 'Usuário'}
          color={params.value === 'developer' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Ativo' : 'Inativo'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    { field: 'nivel', headerName: 'Nível', width: 80 },
    {
      field: 'data_inicio_fast',
      headerName: 'Data Início',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return '-';
        return new Date(params.value as string).toLocaleDateString('pt-BR');
      },
    },
    { field: 'lider_educador', headerName: 'Líder Educador', width: 150 },
    { field: 'padrinho', headerName: 'Padrinho', width: 150 },
    { field: 'analista', headerName: 'Analista', width: 150 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => openEditDialog(params.row)}
            title="Editar Usuário"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => openResetDialog(params.row.user)}
            title="Redefinir Senha"
            size="small"
          >
            <LockResetIcon />
          </IconButton>
          {params.row.active ? (
            <IconButton
              color="error"
              onClick={() => handleDeactivateUser(params.row.user)}
              title="Desativar Usuário"
              size="small"
            >
              <PersonOffIcon />
            </IconButton>
          ) : (
            <IconButton
              color="success"
              onClick={() => handleActivateUser(params.row.user, params.row.department)}
              title="Ativar Usuário"
              size="small"
            >
              <PersonIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const departments = [
    'Consultor',
    'Analista',
    'Developer',
    'Comercial',
    'HelpDesk',
    'Diretor',
    'Gestor',
  ];

  const filteredUsers = users.filter(user => 
    activeTab === 0 ? user.active : !user.active
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon fontSize="large" />
              Gestão de Usuários
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenNewUserDialog(true)}
              >
                Novo Usuário
              </Button>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label={`Usuários Ativos (${users.filter(u => u.active).length})`} />
            <Tab label={`Usuários Inativos (${users.filter(u => !u.active).length})`} />
          </Tabs>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Dialog Novo Usuário */}
      <Dialog open={openNewUserDialog} onClose={() => setOpenNewUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Criar Novo Usuário</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Usuário"
                value={newUser.user}
                onChange={(e) => setNewUser({ ...newUser, user: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Departamento"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Função"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nível"
                type="number"
                value={newUser.nivel}
                onChange={(e) => setNewUser({ ...newUser, nivel: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Data Início FAST"
                type="date"
                value={newUser.data_inicio_fast}
                onChange={(e) => setNewUser({ ...newUser, data_inicio_fast: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Líder Educador"
                value={newUser.lider_educador}
                onChange={(e) => setNewUser({ ...newUser, lider_educador: e.target.value })}
              />
              <TextField
                fullWidth
                label="Padrinho"
                value={newUser.padrinho}
                onChange={(e) => setNewUser({ ...newUser, padrinho: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Analista (opcional)"
              value={newUser.analista}
              onChange={(e) => setNewUser({ ...newUser, analista: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewUserDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={!newUser.user || !newUser.password}
          >
            Criar Usuário
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Reset Senha */}
      <Dialog open={openResetPasswordDialog} onClose={() => setOpenResetPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Redefinir Senha</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Usuário"
              value={resetPassword.username}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nova Senha"
              type={showNewPassword ? 'text' : 'password'}
              value={resetPassword.newPassword}
              onChange={(e) => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetPasswordDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            color="warning"
            disabled={!resetPassword.newPassword}
          >
            Redefinir Senha
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar Usuário */}
      <Dialog open={openEditUserDialog} onClose={() => setOpenEditUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Usuário: {editingUsername}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Departamento"
                value={editUser.department}
                onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
                <MenuItem value="Unemployed">Unemployed</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Função"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nível"
                type="number"
                value={editUser.nivel}
                onChange={(e) => setEditUser({ ...editUser, nivel: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Data Início FAST"
                type="date"
                value={editUser.data_inicio_fast}
                onChange={(e) => setEditUser({ ...editUser, data_inicio_fast: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Líder Educador"
                value={editUser.lider_educador}
                onChange={(e) => setEditUser({ ...editUser, lider_educador: e.target.value })}
              />
              <TextField
                fullWidth
                label="Padrinho"
                value={editUser.padrinho}
                onChange={(e) => setEditUser({ ...editUser, padrinho: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Analista (opcional)"
              value={editUser.analista}
              onChange={(e) => setEditUser({ ...editUser, analista: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditUserDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
          >
            Atualizar Usuário
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignUp;