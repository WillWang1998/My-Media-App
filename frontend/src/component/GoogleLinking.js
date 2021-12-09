import React, {useEffect, useState} from "react";
import {showBackendMessage} from "../util/Functions";
import {Button, Form, message, Space} from "antd";
import {formItemLayout, tailFormItemLayout} from "../util/Layout";
import {GoogleOutlined} from "@ant-design/icons";

const GoogleLinking = () => {

    message.config({
        rtl: false,
    });
    const [googleEmail, setGoogleEmail] = useState("");
    const [disableUnlink, setDisableUnlink] = useState(true);

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/google_email", {
            method: "GET",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            setGoogleEmail(res.google_email);
            if (res.google_email) {
                setDisableUnlink(false);
            }
        }).catch(err => message.error(err, 1));
    }

    useEffect(() => load(), []);

    const cancelLinking = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/unlink_google_account", {
            method: "DELETE",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else if (res.status !== 404) {
                throw res.statusText;
            } else {
                message.warn("This account has not been linked to a google account!", 1);
            }
        }).then(() => {
            setGoogleEmail("");
            setDisableUnlink(true);
        }).catch(err => message.error(err, 1));
    }


    const onFinish = async () => {
        window.location.href = "https://comp531-rw48-mymedia.herokuapp.com/api/auth/google";
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
                <Space size={8}>
                    <Button type="primary" htmlType="submit">
                        Link your account with {<GoogleOutlined/>}
                    </Button>
                    <Button danger disabled={disableUnlink} onClick={cancelLinking}>
                        Unlink your account with {<GoogleOutlined/>}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

export default GoogleLinking;
