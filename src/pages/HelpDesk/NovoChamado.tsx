import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Construction, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NovoChamado = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 3,
          maxWidth: 600,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Construction 
            sx={{ 
              fontSize: 120, 
              color: '#FF5722',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              animation: 'pulse 2s infinite'
            }} 
          />
        </Box>
        
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: '#333',
            mb: 2,
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          Página em Desenvolvimento
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#666',
            mb: 3,
            fontStyle: 'italic'
          }}
        >
          Novo Chamado
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#777',
            mb: 4,
            lineHeight: 1.6
          }}
        >
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve. 
          Nossa equipe está trabalhando para trazer a melhor experiência para você!
        </Typography>
        
        <Box 
          component="button"
          onClick={() => navigate('/home')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1.5,
            backgroundColor: '#FF5722',
            color: 'white',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#E64A19',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)'
            }
          }}
        >
          <ArrowBack />
          Voltar ao Dashboard
        </Box>
      </Paper>
      
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Container>
  );
};

export default NovoChamado;