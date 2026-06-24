import axios, { type AxiosRequestConfig } from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL as string | undefined;

/** ngrok free tier returns an HTML interstitial unless this header is sent; browsers then report a CORS failure. */
const tunnelHeaders = baseUrl && /ngrok/i.test(baseUrl) ? { 'ngrok-skip-browser-warning': 'true' } : {};

class GenericService {
  /**
   * This is a function responsible to manipulate data to send API with method GET
   * @param {string} apiUrl the api route that we need to hit
   * @param {string} urlParams Any url param that you need to add after '?' while sending request
   * @return {object}
   */
  get = async (apiUrl: string, urlParams?: string): Promise<object> => {
    return new Promise((resolve, reject) => {
      let apiRoute = `${baseUrl}/${apiUrl}`;
      if (urlParams) {
        apiRoute += `?${urlParams}`;
      }
      this.makeRequest(apiRoute, 'GET', null)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          this.logError(error);
          reject(error);
        });
    });
  };

  /**
   * This is a function responsible to manipulate data to send API with method POST
   * @param {string} apiUrl the api route that we need to hit
   * @param {object} payload json object that we want to add in request's body while sending request
   * @return {object}
   */
  post = async (apiUrl: string, payload: any): Promise<object> => {
    return new Promise((resolve, reject) => {
      this.makeRequest(`${baseUrl}/${apiUrl}`, 'POST', payload, false)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          this.logError(error);
          reject(error);
        });
    });
  };

  /**
   * This is a function responsible to manipulate data to send API with method PUT
   * @param {string} apiUrl the api route that we need to hit
   * @param {object} payload json object that we want to add in request's body while sending request
   * @return {object}
   */
  put = async (apiUrl: string, payload: any): Promise<object> => {
    return new Promise((resolve, reject) => {
      this.makeRequest(`${baseUrl}/${apiUrl}`, 'PUT', payload)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          this.logError(error);
          reject(error);
        });
    });
  };

  /**
   * This is a function responsible to manipulate data to send API with method DELETE
   * @param {string} apiUrl the api route that we need to hit
   * @param {number} id we need to add the id here, it will be attached automatically at the end of string of api route
   * @return {object}
   */
  delete = async (apiUrl: string): Promise<object> => {
    return new Promise((resolve, reject) => {
      this.makeRequest(`${baseUrl}/${apiUrl}`, 'DELETE')
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          this.logError(error);
          reject(error);
        });
    });
  };

  /**
   * This is a function responsible to manipulate data to send API with method PUT when it contains any file
   * @param {string} apiUrl the api route that we need to hit
   * @param {object} payload json object that we want to add in request's body while sending request
   * @return {object}
   */
  putWithFile = async (apiUrl: string, payload: any): Promise<object> => {
    return new Promise((resolve, reject) => {
      this.makeRequest(`${baseUrl}/${apiUrl}`, 'PUT', payload, true)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          this.logError(error);
          reject(error);
        });
    });
  };

  /**
   * This is a dynamic function responsible to send API request for every method.
   * @param {string} url it includes the api route along with the base url attached as a prefix
   * @param {string} method method indicates what type of request is it.
   * @param {object} data json object that we want to add in request's body while sending request
   * @param {boolean} containsFile boolean to check if request contains any file
   * @return {object}
   */
  makeRequest = async (url: string, method: string, data?: any, containsFile?: boolean): Promise<object> => {
    const headers: any = await this.generateHeader(containsFile);

    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      data,
      headers: { ...tunnelHeaders, ...headers },
    };

    return new Promise((resolve, reject) => {
      axios(axiosConfig)
        .then((response: { data: object | PromiseLike<object> }) => {
          resolve(response.data);
        })
        .catch((error: any) => {
          // Always reject errors, don't resolve them as success
          reject(error);
        });
    });
  };

  /**
   * This is a dynamic function responsible to generate headers on the bases of token in local storage.
   * @param {boolean} containsFile boolean to check if request contains any file
   * @return {object}
   */

  private isTokenExpired = (): boolean => {
    const token = localStorage.getItem('hms-token');
    if (!token) return true;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      if (!payload.exp) return true;
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  generateHeader = (containsFile?: boolean): object => {
    return new Promise((resolve, reject) => {
      let headers: any;

      if (containsFile) {
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };
      }

      const token = localStorage.getItem('hms-token');
      if (token) {
        // Check if token is expired before making request
        if (this.isTokenExpired()) {
          localStorage.removeItem('hms-token');
          localStorage.removeItem('hms-user');
          window.location.href = '/signin';
          reject(new Error('Token expired'));
          return;
        }
        headers['Authorization'] = 'Bearer ' + token;
      }
      resolve(headers);
    });
  };

  /**
   * I created this function to log the error in proper format so we can understand the reason.
   * @param {string} error we use the to expand and display error in proper way and reason of error
   */
  logError = (error: any) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/signin';
    }
    if (error.response) {
      // The request was made and the server responded with a non-2xx status code
      console.error('Server Error:', error.response.data);
      console.error('Status Code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
  };
}

export default GenericService;
