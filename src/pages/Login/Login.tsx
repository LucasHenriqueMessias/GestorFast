import React, { useState } from 'react'
import './Login.css';
import { setAccessToken, setDepartment, setNivel, setUsername } from '../../utils/storage';
import axios from 'axios';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (login === '' || password === '') {
            alert('Por favor, preencha todos os campos.');
        } else {
            setUsername(login);
            try {

                console.log('Tentando fazer login com:', { login, password });
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                    user: login,
                    password
                });
                const { access_token } = response.data;
                console.log('Login bem-sucedido:', response.data);
                console.log('Access Token:', access_token);
                setAccessToken(access_token);

                const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/login/get/user/${login}`, {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });

                const { department, nivel } = userResponse.data;
                setDepartment(department);
                setNivel(nivel);

                // Aguarda o storage ser atualizado antes de navegar
                setTimeout(() => {
                    alert('Login bem-sucedido!');
                    window.location.replace('/home');
                }, 100);
                
            } catch (error) {
                console.error(error);
                if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
                    alert('Erro de conexão. Por favor, tente novamente.');
                } else {
                    alert('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
                }
            }
        }
    };




  return (
    <div className="login-container">
        <div className="login-container-image" style={{ backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20231013/pngtree-smooth-light-gradient-blur-wallpaper-with-simple-plain-blue-background-texture-image_13641833.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>

        </div>
        <div className="login-container-login">
            <form className="login-container-login-form" onSubmit={handleSubmit}>
              <img src="https://www.fastassessoria.com.br/img/logo.png" style={{width: '76%'}} alt='logotipo fast assessoria'/>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Login"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  autoComplete="username"
                />
                <div className="login-password-wrapper">
                  <input
                    className="login-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <button className="login-btn" type="submit">Entrar</button>
            </form>
        </div>
    </div>
  )
}

export default Login