import React, {useEffect, useState} from "react";
import {showBackendMessage} from "../util/Functions";
import EventBus from "../util/EventBus";
import {Button, Form, message} from "antd";
import {formItemLayout, tailFormItemLayout} from "../util/Layout";
import {GoogleOutlined} from "@ant-design/icons";

const GoogleLinking = () => {

    message.config({
        rtl: false,
    });
    const [googleEmail, setGoogleEmail] = useState("");

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/google_email", {
            method: "GET",
            credentials: "include",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setGoogleEmail(res.google_email);
        }).catch(err => message.error(err, 1));
    }

    useEffect(() => load(), []);
    EventBus.addEventListener("reload_google_binding", load);
    EventBus.addEventListener("reload_all", load);
    EventBus.addEventListener("clear_all_states", () => {
        setGoogleEmail("");
    });

    const onFinish = async () => {
        window.location.href = "https://comp531-rw48-mymedia-backend.herokuapp.com/auth/google";
    }

    return (
        <Form {...formItemLayout}
              name="userGoogleBinding"
              autoComplete="off"
              onFinish={onFinish}
        >
            <Form.Item name="googleEmail"
                       label="Google Account"
            >
                <span className="ant-form-text">
                    {googleEmail ? googleEmail : "You have not linked your Google account."}
                </span>
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Link your account with {<GoogleOutlined/>}
                </Button>
            </Form.Item>
        </Form>
    )
}

export default GoogleLinking;
