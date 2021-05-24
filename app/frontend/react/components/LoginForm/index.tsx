import React from 'react';
import { Button, Card, Input, Form } from 'antd';
import { UserOutlined, SecurityScanOutlined } from '@ant-design/icons';

import ScaleInWrapper from '../ScaleInWrapper'

const { Meta } = Card;

export interface FormValue {
  username: string;
  password: string
}

interface LoginFormProps {
  onRegister: () => void;
  onSubmit: (value: FormValue) => void;
}

function LoginForm({ onSubmit, onRegister }: LoginFormProps) {
  const [form] = Form.useForm<FormValue>()

  return (
    <ScaleInWrapper>
      <Card className="w-80 shadow-lg">
        <header className="h-14">
          <div className="flex items-center justify-around text-sm">
            <span className="flex-grow text-center font-bold">Login</span>
          </div>
        </header>

        <Form form={form} className="w-full" onFinish={onSubmit}>
          <Form.Item name="username">
            <Input prefix={<UserOutlined />} placeholder="Your name" />
          </Form.Item>
          <Form.Item name="password">
            <Input.Password prefix={<SecurityScanOutlined />} placeholder="Password" />
          </Form.Item>
          <Button className="w-full" type="primary" htmlType="submit">Confirm</Button>
        </Form>

        <div className="text-right py-4 cursor-pointer" onClick={onRegister}>
          <Meta description="Register" />
        </div>
      </Card>
    </ScaleInWrapper>
  )
}

export default React.memo(LoginForm)
