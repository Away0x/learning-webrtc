import React, { useState } from 'react';
import { message } from 'antd';

import LoginForm, { FormValue as LoginFormValue } from 'react/components/LoginForm'
import RegisterUserForm, { FormValue as RegisterFormValue } from 'react/components/RegisterUserForm'
import { loginService, registerService } from 'services'

enum CardState {
  Login = 1,
  Register = 2,
}

function Login() {
  const [cardState, setCardState] = useState<CardState>(CardState.Login);

  const handleLogin = async (val: LoginFormValue) => {
    const result = await loginService(val.username, val.password);

    if (result.success && result.data) {
      window.location.reload()
    }
  }

  const handleRegister = async (val: RegisterFormValue) => {
    const status = await registerService(val.username, val.password, val.password_confirmation);

    if (status) {
      setCardState(CardState.Login);
      message.success('注册成功，请登录')
    }
  }

  const content = () => {
    if (cardState === CardState.Login) {
      return <LoginForm
        onRegister={() => setCardState(CardState.Register)}
        onSubmit={handleLogin} />
    }

    return <RegisterUserForm
      onBack={() => setCardState(CardState.Login)}
      onSubmit={handleRegister} />
  }

  return <div className="g-container g-bg flex justify-center items-center">
    {content()}
  </div>
}

export default Login
