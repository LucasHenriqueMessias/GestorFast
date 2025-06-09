/*
Autor: Lucas Henrique Messias Gonçalves
Data de Criação: 21/10/2024
Última Modificação: 21/10/2024
Descrição: Este arquivo contém o componente PrivateRoute, que é utilizado para proteger as rotas de acesso.
Caso o usuário não esteja autenticado, ele é redirecionado para a página de login.

*/

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken, getDepartment } from '../utils/storage';

type PrivateRouteProps = {
  children: React.ReactNode;
  allowedDepartments: string[];
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedDepartments }) => {
  const token = getAccessToken();
  const department = getDepartment();

  if (!token) {
    console.log(token)
    return <Navigate to="/login" />;
  }

  if (!allowedDepartments.includes(department || '')) {
    alert('Você não tem permissão para acessar essa página.');
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;