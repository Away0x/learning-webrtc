import React from 'react';
import { Button, Card, Input, Form } from 'antd';
import { ArrowLeftOutlined, UserOutlined, SecurityScanOutlined } from '@ant-design/icons';

import ScaleInWrapper from '../ScaleInWrapper'

export interface FormValue {
  username: string;
  password: string;
  password_confirmation: string;
}

interface RegisterUserFormProps {
  onBack: () => void;
  onSubmit: (value: FormValue) => void;
}

function RegisterUserForm({ onBack, onSubmit }: RegisterUserFormProps) {
  const [form] = Form.useForm<FormValue>()

  return (
    <ScaleInWrapper>
      <Card className="w-80 shadow-lg">
        <header className="h-14">
          <div className="flex items-center justify-around text-sm">
            <ArrowLeftOutlined className="cursor-pointer" onClick={onBack} />
            <span className="flex-grow text-center font-bold">Register</span>
          </div>
        </header>

        <Form form={form} className="w-full" onFinish={onSubmit}>
          <Form.Item name="username">
            <Input prefix={<UserOutlined />} placeholder="Your name" />
          </Form.Item>
          <Form.Item name="password">
            <Input.Password prefix={<SecurityScanOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item name="password_confirmation">
            <Input.Password prefix={<SecurityScanOutlined />} placeholder="Password" />
          </Form.Item>
          <Button className="w-full" type="primary" htmlType="submit">Confirm</Button>
        </Form>
      </Card>
    </ScaleInWrapper>
  )
}

export default React.memo(RegisterUserForm)
