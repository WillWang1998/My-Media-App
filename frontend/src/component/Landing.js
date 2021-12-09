import React, {useEffect, useState} from "react";
import {Card, message} from "antd";
import '../App.css';
import LogInForm from "./LogInForm";
import RegisterForm from "./RegisterForm";
import {showBackendMessage} from "../util/Functions";


const Landing = () => {

    message.config({
        rtl: false,
    });

    const [key, setState] = useState("login");

    useEffect(showBackendMessage, []);

    const logInOrRegisterKeyTab = [
        {
            key: "login",
            tab: 'Log In',
        },
        {
            key: "register",
            tab: "Register",
        },
    ];

    const logInOrRegisterComponents = {
        login: <LogInForm/>,
        register: <RegisterForm/>,
    };

    const onTabChange = (key) => {
        setState(key);
    }

    return (
        <Card style={{
            width: "50%",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
        }}
              bordered={true}
              tabList={logInOrRegisterKeyTab}
              activeTabKey={key}
              onTabChange={newKey => {
                  onTabChange(newKey);
              }}
        >
            {logInOrRegisterComponents[key]}
        </Card>
    );
}

export default Landing;
