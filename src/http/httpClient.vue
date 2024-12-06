<script>
import axios from "axios";


const baseUrl = `http://192.168.100.73:1154/api`
let httpClient = {
    postDataFromHttpClient: async (url, contentBody) => {
        let response = await axios.post(`${baseUrl}${url}`, contentBody);
        return response.data
    },
    getDataFromHttpClient: async (url) => {
        let response = await axios.get(`${baseUrl}${url}`);
        return response.data
    }
};

export default httpClient;

</script>
