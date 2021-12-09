import React, {useEffect, useState} from "react";
import {Button, DatePicker, Form, Input, message, Space} from "antd";
import {formItemLayout, tailFormItemLayout} from "../util/Layout";
import {useHistory} from "react-router-dom";
import {disabledDate, showBackendMessage} from "../util/Functions";
import Cookies from "js-cookie";
import EventBus from "../util/EventBus";

const RegisterForm = () => {

    message.config({
        rtl: false,
    });
    const [form] = Form.useForm();
    const history = useHistory();
    const [username, setUsername] = useState("");
    const [displayedName, setDisplayedName] = useState("")
    const [email, setEmail] = useState("");


    const load = () => {
        setUsername(Cookies.get("usernameForGoogle"));
        setDisplayedName(Cookies.get("displayedNameForGoogle"));
        setEmail(Cookies.get("emailForGoogle"));
    }

    useEffect(() => {
        form.setFieldsValue({
            "username": username,
            "displayedName": displayedName,
            "email": email,
        });
    }, [username, displayedName, email]);

    useEffect(load, []);

    EventBus.addEventListener("clear_all_states", () => {
        setUsername("");
        setDisplayedName("");
        setEmail("");
    });
    EventBus.addEventListener("reload_all", load);

    const onFinish = async (values) => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/register",{
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: values.username,
                email: values.email,
                phone: values.phone,
                dob: values.dob.toDate(),
                zipcode: values.zipcode,
                displayedName: values.displayedName,
                password: values.password
            }),
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(() => {
            message.success("Register successfully!");
            history.push({
                pathname:"/home"
            });
        }).catch(err => message.error(err, 1));
    };

    return (
        <Form {...formItemLayout}
              name="register"
              layout="horizontal"
              autoComplete="off"
              onFinish={onFinish}
              form={form}
        >
            <Form.Item name="username"
                       label="Username"
                       rules={[
                           {
                               pattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
                               message: 'Your account name can contain lowercase and uppercase Latin letter and number. The first letter cannot be a number.'
                           },
                           {
                               required: true,
                               message: 'Please input your username!',
                           }
                       ]}
            >
                <Input/>
            </Form.Item>

            <Form.Item name="displayedName"
                       label="Displayed Name"
                       rules={[
                           {
                               pattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
                               message: 'Your account name can contain lowercase and uppercase Latin letter and number. The first letter cannot be a number.'
                           },
                       ]}
            >
                <Input/>
            </Form.Item>

            <Form.Item name="email"
                       label="E-mail"
                       rules={[
                           {
                               type: 'email',
                               message: 'Please input your valid E-mail like a@b.co!',
                           },
                           {
                               required: true,
                               message: 'Please input your E-mail!',
                           },
                       ]}
            >
                <Input placeholder="a@b.co"/>
            </Form.Item>

            <Form.Item name="phone"
                       label="Phone Number"
                       rules={[
                           {
                               pattern: /^[0-9]{10}$/,
                               message: 'Please input your phone number like 1231231234!'
                           },
                           {
                               required: true,
                               message: 'Please input your phone number!',
                           },
                       ]}
            >
                <Input placeholder="1231231234"/>
            </Form.Item>

            <Form.Item name="dob"
                       label="Date of Birth"
                       rules={[
                           {
                               required: true,
                               message: 'Please input your date of birth!',
                           },
                       ]}
                       extra="Only individuals 18 years of age or older on the day of registration are allowed to register."
            >
                <DatePicker format={'MM/DD/YYYY'}
                            style={{width: '100%'}}
                            disabledDate={disabledDate}/>
            </Form.Item>

            <Form.Item name="zipcode"
                       label="Zipcode"
                       rules={[
                           {
                               pattern: /^[0-9]{5}$/,
                               message: 'Please input your phone zipcode like 12345!'
                           },
                           {
                               required: true,
                               message: 'Please input your phone zipcode!',
                           },
                       ]}
            >
                <Input placeholder="12345"/>
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
                <Input.Password visibilityToggle={false}/>
            </Form.Item>

            <Form.Item
                name="passwordConfirmation"
                label="Confirmation"
                dependencies={['password']}
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    ({getFieldValue}) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords you entered do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password visibilityToggle={false}/>
            </Form.Item>


            <Form.Item {...tailFormItemLayout}>
                <Space size={8}>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                    <Button htmlType="reset">
                        Reset
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

export default RegisterForm;
