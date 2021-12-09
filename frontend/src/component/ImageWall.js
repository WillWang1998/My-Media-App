// TODO: The wall is using a "stack", need to become "array(vector)."
import React, {memo, useEffect, useState} from "react";
import {PlusOutlined} from "@ant-design/icons";
import {Modal, Upload} from "antd";
import EventBus from "../util/EventBus";
import {stringArrayEqual} from "../util/Functions";


const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

const urlsToFiles = (urls) => {
    if (urls) {
        return urls.map((item) => {
            let fileName = item.split("/").slice(-1)[0];
            let fileUid = fileName.split(".").slice(0, -1).join("");
            return {
                uid: fileUid,
                name: fileName,
                status: 'done',
                url: item,
            }
        })
    } else {
        return [];
    }
}

const ImagesWall = (props) => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [fileList, setFileList] = useState(urlsToFiles(props.imageUrlsList));

    useEffect(() => {
        setFileList(fileList => urlsToFiles(props.imageUrlsList));
    }, [props]);

    const handleCancel = () => {
        setPreviewVisible(false);
    }

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(
            file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        );
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
        let fileListStatus = [];
        fileList.forEach(item => fileListStatus.push(item.status));
        if (fileListStatus.every(item => item === "done")) {
            let curImageUrlsList = [];
            for (let file of fileList) {
                curImageUrlsList.push(file.url || file.response.url);
            }
            props.action(imageUrlsList => curImageUrlsList);
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <>
            <Upload
                name="image"
                action="https://comp531-rw48-mymedia.herokuapp.com/api/upload/image"
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
            >
                {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            <Modal
                visible={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={handleCancel}
            >
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

const areEqualImagesWall = (prevProps, nextProps) => {
    return stringArrayEqual(prevProps.imageUrlsList, nextProps.imageUrlsList);
}

export default memo(ImagesWall, areEqualImagesWall);
