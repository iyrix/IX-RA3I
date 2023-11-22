import axios from 'axios';


const instance =  axios.create({
    baseURL: "http://127.0.0.1:8000",
    withCredentials: false,
})
// instance.interceptors.request.use(
//     config => {
//       config.headers['Access-Control-Allow-Credentials'] = true;
//           return config;
//       },
//       error => {
//           return Promise.reject(error);
//       }
//   );

  export default instance;