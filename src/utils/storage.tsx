/*
Autor: Lucas Henrique Messias Gonçalves
Data de Criação: 21/10/2024
Descrição: Este arquivo contém funções para manipular o armazenamento local do navegador.
Nele é salvo o acces_token, que é utilizado para fazer requisições autenticadas ao servidor por meio de api.


Última Modificação: 23/10/2024
Modificado: Adicionado funções para manipular o usuário logado, token de usuário
*/


// Function to set the access_token in localStorage
export const setAccessToken = (token: string): void => {
    localStorage.setItem('access_token', token);
};

// Function to get the access_token from localStorage
export const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
};

// Function to remove the access_token from localStorage
export const removeAccessToken = (): void => {
    localStorage.removeItem('access_token');
};

// Function to set the user in localStorage
export const setUsername = (user: string): void => {
    localStorage.setItem('user', user);
}

// Function to get the user from localStorage
export const getUsername = (): string | null => {
    return localStorage.getItem('user');
}

// Function to remove the user from localStorage
export const removeUser = (): void => {
    localStorage.removeItem('user');
}


// Function to get the department from localStorage
export const getDepartment = (): string | null => {
    return localStorage.getItem('department');
}

// Function to set the department in localStorage
export const setDepartment = (department: string): void => {
    localStorage.setItem('department', department);
}

export const getNivel = (): string | null => {
    return localStorage.getItem('nivel');
}

export const setNivel = (nivel: string): void => {
    localStorage.setItem('nivel', nivel);
}