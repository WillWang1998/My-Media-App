import React from "react";
import {message, Button, Form, Input, Space} from "antd";
import {formItemLayout, tailFormItemLayout} from '../util/Layout';
import {GoogleOutlined} from "@ant-design/icons";
import {useHistory} from "react-router-dom";
import {showBackendMessage} from "../util/Functions";


const LogInForm = () => {
    message.config({
        rtl: false,
    });

    const history = useHistory();

    const onFinish = async (values) => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: values.username,
                password: values.password,
            }),
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(() => {
            history.push({
                pathname: "/home"
            });
            message.config({
                rtl: false,
            });
            message.success("Login Successfully!");
        }).catch(err => message.error(err, 1));
    };

    const googleLogin =  () => {
        window.location.href = "https://comp531-rw48-mymedia.herokuapp.com/auth/google";
    }

    return (
        <Form {...formItemLayout}
              name="logIn"
              autoComplete="off"
              layout="horizontal"
              onFinish={onFinish}
        >

            <Form.Item name="username"
                       label="Username"
                       rules={[
                           {
                               required: true,
                               message: 'Please input your username!',
                           }
                       ]}
            >
                <Input/>
            </Form.Item>

            <Form.Item name="password"
                       label="Password"
                       rules={[
                           {
                               required: true,
                               message: 'Please input your password!',
                           }
                       ]}
            >
                <Input.Password/>
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Space size={8}>
                    <Button type="primary" htmlType="submit">
                        Log in
                    </Button>
                    <Button type="default" htmlType="button" onClick={googleLogin}>
                        Log in with <GoogleOutlined />
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default LogInForm;