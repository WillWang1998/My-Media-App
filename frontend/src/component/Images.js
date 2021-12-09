import React, {useState} from "react";
import {Image} from "antd";

const Images = (props) => {
    const [visible, setVisible] = useState(false);
    return (
        <>
            <Image
                preview={{ visible: false }}
                src={props.images[0]}
                onClick={() => setVisible(true)}
                style={{
                    width: "200px"
                }}
            />
            <div style={{ display: 'none' }}>
                <Image.PreviewGroup preview={{ visible, onVisibleChange: vis => setVisible(vis) }}>
                    {props.images.map(item => <Image src={item} />)}
                </Image.PreviewGroup>
            </div>
        </>
    );
}

export default Images;
