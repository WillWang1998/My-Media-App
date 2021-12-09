import React, {memo, useEffect, useState} from "react";
import {Input, Button, Form, Card, Divider, message} from "antd";
import {showBackendMessage, stringArrayEqual} from "../util/Functions";
import ImagesWall from "./ImageWall";


// TODO: React.lazy
const SubmitOrEditArticle = (props) => {
    message.config({
        rtl: false,
    });
    const [form] = Form.useForm();
    const [imageUrlsList, setImageUrlsList] = useState(props.imageUrlsList);

    useEffect(() => {
        form.setFieldsValue({
            "title": props.title,
            "text": props.text,
        });
        setImageUrlsList(imageUrlsList => props.imageUrlsList);
    }, [form, props]);

    const onFinish = async (values) => {
        if (props.id) {
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/article/" + props.id, {
                method: "PUT",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: values.title,
                    text: values.text,
                    images: imageUrlsList,
                }),
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(res => {
                message.success("Edit Successfully");
                props.action({
                    id: res._id,
                    title: res.title,
                    text: res.text,
                    timestamp: res.timestamp,
                    images: res.images,
                });
            }).catch(err => message.error(err, 1));
        } else {
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/article", {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: values.title,
                    text: values.text,
                    images: imageUrlsList,
                }),
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(res => {
                message.success("Submit Successfully", 1);
                props.action(res._id);
            }).catch(err => message.error(err, 1));
        }
    }

    return (
        <Card bordered={true}>
            <Divider orientation="left">{
                props.id ? "Edit this article" : "Add new article"
            }</Divider>
            <Form onFinish={onFinish} form={form}>
                <Form.Item name="title">
                    <Input/>
                </Form.Item>
                <Form.Item name="text">
                    <Input.TextArea/>
                </Form.Item>
                <Form.Item>
                    <ImagesWall
                        imageUrlsList={imageUrlsList}
                        action={setImageUrlsList} />
                </Form.Item>
                <Form.Item>
                    <Button style={{width: "50%"}} htmlType="submit" type="primary">
                        Submit
                    </Button>
                    <Button style={{width: "50%"}} htmlType="reset" type="default">
                        Clear
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

const areEqualSubmitOrEditArticle = (prevProps, nextProps) => {
    return prevProps.id === nextProps.id
        && prevProps.title === nextProps.title
        && prevProps.text === nextProps.text
        && stringArrayEqual(prevProps.imageUrlsList, nextProps.imageUrlsList);
}

export default memo(SubmitOrEditArticle, areEqualSubmitOrEditArticle);
