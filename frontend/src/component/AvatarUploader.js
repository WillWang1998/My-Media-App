// TODO: Uploader animation
import React, {useEffect, useState} from "react";
import {beforeUpload, showBackendMessage} from "../util/Functions";
import EventBus from "../util/EventBus";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, message, Upload, Space, Row} from "antd";

const AvatarUploader = () => {

    message.config({
        rtl: false,
    })

    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploaded, setUploaded] = useState(false);

    const load = async () => {
        await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/avatar", {
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
            setImageUrl(res.avatar);
        }).catch(err => message.error(err, 1));
    };
    useEffect(() => load(), []);
    EventBus.addEventListener("reload_avatar_uploader", load);

    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            setImageUrl(info.file.response.url);
            setLoading(false);
            setUploaded(true);
        }
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const update = async () => {
        if (uploaded) {
            await fetch("https://comp531-rw48-mymedia.herokuapp.com/api/avatar", {
                method: "PUT",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    avatar: imageUrl,
                }),
            }).then(res => {
                if (res.ok) {
                    showBackendMessage();
                    return res.json();
                } else {
                    throw res.statusText;
                }
            }).then(() => {
                message.success("Update successfully!", 1);
                EventBus.dispatchEvent("reload_min_profile");
                EventBus.dispatchEvent("reload_articles");
            }).catch(err => message.error(err, 1));
        }
    };

    return (
        <Row justify="center">
            <Space align="center" direction="vertical">
                <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="https://comp531-rw48-mymedia-backend.herokuapp.com/upload/avatar"
                    withCredentials={true}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                >
                    {imageUrl ? (
                        <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                    ) : (
                        uploadButton
                    )}
                </Upload>
                <Button type="primary" onClick={update}>
                    Click the avatar to upload a new one, and then click here to submit the update.
                </Button>
            </Space>
        </Row>
    );
};

export default AvatarUploader;
