import React from 'react';
import { Container, Box, Button } from '@mui/material';
import {  Assessment, Person, Announcement } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RelatorioDiretoria = () => {
  const navigate = useNavigate();

  const goGeral = () => navigate('/Relatorios/Diretoria/Faturamento/Geral');
  const goConsultor = () => navigate('/Relatorios/Diretoria/Faturamento/Consultor');
  const goAvisoPrevio = () => navigate('/Relatorios/Diretoria/AvisoPrevio');

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
            onClick={goGeral}
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
            Faturamento Geral
          </Button>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={goConsultor}
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
            Faturamento por Consultor
          </Button>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '300px' } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={goAvisoPrevio}
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
            <Announcement sx={{ fontSize: 48 }} />
            Aviso Prévio
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RelatorioDiretoria;