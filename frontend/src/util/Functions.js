import {message} from "antd";
import Cookies from 'js-cookie'

export const isLoggedInAsCookie = () => {
    console.log("document.cookie", document.cookie);
    console.log("Cookies.get(\"isLoggedIn\")", Cookies.get("isLoggedIn"));
    return !!Cookies.get("isLoggedIn");
}

export const isRegisteringWithGoogle = () => {
    return !!Cookies.get("usernameForGoogle");
}

export const disabledDate = (current) => {
    let nowTime = new Date(Date.now());
    let nowYear = nowTime.getFullYear(),
        nowMonth = nowTime.getMonth(),
        nowDate = nowTime.getDate();
    if (current) {
        let selectYear = current.year(),
            selectMonth = current.month(),
            selectDate = current.date();
        return (nowYear - selectYear < 18)
            || (nowYear - selectYear === 18 && nowMonth < selectMonth)
            || (nowYear - selectYear === 18 && nowMonth === selectMonth && nowDate < selectDate);
    }
    return false;
}

export const beforeUpload = async (file) => {
    const isImage = file.type.split("/")[0] === 'image';
    if (!isImage) {
        await message.error('You can only upload image!', 1);
    }
    return isImage;
}

export const showBackendMessage = async () => {
    let backendMessage = Cookies.get("backendMessage");
    if (backendMessage) {
        let backendMessageList = backendMessage.split("#");
        if (backendMessageList[0] === "error") {
            message.error(backendMessageList[1], 1);
        } else if (backendMessageList[0] === "success") {
            message.success(backendMessageList[1], 1);
        } else if (backendMessageList[0] === "info") {
            message.info(backendMessageList[1], 1);
        } else if (backendMessageList[0] === "warning") {
            message.warning(backendMessageList[1], 1);
        } else if (backendMessageList[0] === "loading") {
            message.loading(backendMessageList[1], 1);
        }
        Cookies.remove("backendMessage");
    }
}

export const stringArrayEqual = (arrayA, arrayB) => {

    if (arrayA && arrayB) {
        let st = new Set();
        for (let s of arrayA) {
            st.add(s);
        }
        for (let s of arrayB) {
            if (!st.has(s)) {
                return false;
            } else {
                st.delete(s);
            }
        }
        return st.size === 0;
    } else return !arrayA && !arrayB;
}
