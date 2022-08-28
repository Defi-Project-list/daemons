import { toast } from "react-toastify";

const toastOptions: any = {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
};

export const infoToast = (text: string) => toast.info(text, toastOptions);
export const successToast = (text: string) => toast.success(text, toastOptions);
export const warningToast = (text: string) => toast.warn(text, toastOptions);
export const errorToast = (text: string) => toast.error(text, toastOptions);
export const promiseToast = (p: any, pending: string, success: string, error: string) =>
    toast.promise(p, { pending, success, error });
