import React, {useEffect} from "react";
import {Button, Card, Row, Col, DatePicker, Divider, Form, Input, message} from "antd";
import {formItemLayout, tailFormItemLayout} from "../util/Layout";
import moment from "moment";
import MyMediaMenu from "./Menu";
import EventBus from "../util/EventBus";
import {disabledDate, showBackendMessage} from "../util/Functions";
import AvatarUploader from "./AvatarUploader";
import PasswordSetup from "./PasswordSetup";
import GoogleLinking from "./GoogleLinking";


const Profile = () => {
    message.config({
        rtl: false,
    });
    const [form] = Form.useForm();

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/profile", {
            method: "GET",
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(res => {
            form.setFieldsValue({
                "username": res.username,
                "displayedName": res.displayedName,
                "email": res.email,
                "phone": res.phone,
                "dob": moment(res.dob),
                "zipcode": res.zipcode,
                "headline": res.headline,
            });
        }).catch(err => message.error(err, 1));
    };

    useEffect(() => load(), []);

    const style = {padding: '46px 0'};

    const onFinish = async (values) => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                displayed_name: values.displayed_name,
                phone: values.phone,
                email: values.email,
                zipcode: values.zipcode,
                headline: values.headline,
                dob: values.dob,
            })
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else {
                throw res.statusText;
            }
        }).then(() => {
            EventBus.dispatchEvent("reload_min_profile");
            EventBus.dispatchEvent("reload_articles");
            message.success("Update successfully!");
        }).catch(err => message.error(err, 1));
    };

    return (
        <>
            <MyMediaMenu/>
            <Row gutter={{xs: 0, sm: 0, md: 0, lg: 0, xl: 0}} style={style}>
                <Col className="gutter-row" xs={0} sm={0} md={0} lg={6} xl={6}/>
                <Col className="gutter-row" xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Card>
                        <Divider orientation="left">Avatar</Divider>
                        <AvatarUploader/>

                        <Divider orientation="left">Information</Divider>
                        <Form {...formItemLayout}
                            form={form}
                            name="updateInformation"
                            autoComplete="off"
                            onFinish={onFinish}
                        >
                            <Form.Item name="username"
                                       label="Username"
                            >
                                <span className="ant-form-text" />
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

                            <Form.Item name="headline"
                                       label="Headline"
                            >
                                <Input.TextArea rows={4}/>
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
                                <Input/>
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
                                <Input/>
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
                                <Input/>
                            </Form.Item>

                            <Form.Item {...tailFormItemLayout}>
                                <Button type="primary" htmlType="submit">
                                    Update
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider orientation="left">Linking your Google Account</Divider>
                        <GoogleLinking/>

                        <Divider orientation="left">Password</Divider>
                        <PasswordSetup/>

                    </Card>
                </Col>
                <Col className="gutter-row" xs={0} sm={0} md={0} lg={6} xl={6}/>
            </Row>
        </>
    )
}

export default Profile;
