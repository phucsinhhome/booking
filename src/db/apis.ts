import axios, { AxiosInstance } from 'axios';

const receptionApi: AxiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_RECEPTION_SERVICE_ENDPOINT}`,
    withCredentials: true
});

export {
    receptionApi
}
