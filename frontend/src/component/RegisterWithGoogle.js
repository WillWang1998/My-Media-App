import React from "react";
import {Card, message} from "antd";
import '../App.css';
import RegisterForm from "./RegisterForm";


const RegisterWithGoogle = () => {
    message.config({
        rtl: false,
    });
    return (
        <Card style={{
            width: '44%',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
        }}
              bordered={true}
        >
            <RegisterForm />
        </Card>
    );
}

export default RegisterWithGoogle;
