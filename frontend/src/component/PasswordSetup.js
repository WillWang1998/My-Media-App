import React from 'react';
import {Button, Form, Input, message} from "antd";
import {formItemLayout, tailFormItemLayout} from "../util/Layout";
import {showBackendMessage} from "../util/Functions";


const PasswordSetup = () => {
    message.config({
        rtl: false,
    });

    const onFinish = async (values) => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newPassword: values.newPassword,
                oldPassword: values.curPassword,
            }),
        }).then(res => {
            if (res.ok) {
                showBackendMessage();
                return res.json();
            } else if (res.status === 401) {
                throw "The old password is wrong!";
            } else {
                throw res.statusText;
            }
        }).then(() => {
            message.success("Update successfully!", 1);
        }).catch(err => message.error(err, 1));
    }

    return (
        <Form {...formItemLayout}
              name="updatePassword"
              autoComplete="off"
              onFinish={onFinish}
        >
            <Form.Item name="curPassword"
                       label="Current Password"
                       rules={[
                           {
                               required: true,
                               message: 'Please input your current password!',
                           }
                       ]}

            >
                <Input.Password visibilityToggle={false}/>
            </Form.Item>

            <Form.Item name="newPassword"
                       label="New Password"
                       rules={[
                           {
                               required: true,
                               message: 'Please input your new password!',
                           }
                       ]}

            >
                <Input.Password visibilityToggle={false}/>
            </Form.Item>

            <Form.Item
                name="newPasswordConfirmation"
                label="Confirmation"
                dependencies={['newPassword']}
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your new password!',
                    },
                    ({getFieldValue}) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
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
                <Button type="primary" htmlType="submit">
                    Update
                </Button>
            </Form.Item>
        </Form>
    )
}

export default PasswordSetup;
