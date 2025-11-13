import React from 'react';
import { Container,  Button, Box } from '@mui/material';
import { Assessment, Person, Description, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Relatorios = () => {
  const navigate = useNavigate();

  const handleRelatorioConsultor = () => {
    navigate('/Relatorios/Consultor');
  };

  const handleRelatorioCliente = () => {
    navigate('/Relatorios/Cliente');
  };

  const handleRelatorioFast = () => {
    navigate('/Relatorios/Fast');
  };

  const handleRelatorioDiretoria = () => {
    navigate('/Relatorios/Diretoria');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 4,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRelatorioConsultor}
            fullWidth
            sx={{
              height: 150,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexDirection: 'column',
              gap: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Person sx={{ fontSize: 48 }} />
            Relatório Consultor
          </Button>
        </Box>
       
        <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRelatorioCliente}
            fullWidth
            sx={{
              height: 150,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexDirection: 'column',
              gap: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Business sx={{ fontSize: 48 }} />
            Relatório Cliente
          </Button>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRelatorioFast}
            fullWidth
            sx={{
              height: 150,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexDirection: 'column',
              gap: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Assessment sx={{ fontSize: 48 }} />
            Relatório Fast
          </Button>
        </Box>
 <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRelatorioDiretoria}
            fullWidth
            sx={{
              height: 150,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              flexDirection: 'column',
              gap: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Description sx={{ fontSize: 48 }} />
            Relatórios da Diretoria
          </Button>
        </Box>
        
      </Box>
    </Container>
  );
}

export default Relatorios