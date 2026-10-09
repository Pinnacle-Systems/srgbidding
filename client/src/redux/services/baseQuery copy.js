import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { getCommonParams } from '../../Utils/helper';
import { encryptData, decryptData } from '../../Utils/encryption';
const BASE_URL = process.env.REACT_APP_SERVER_URL;


const baseQuery = () => {
    const baseQueryFetch = fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers, { getState }) => {
            const { token } = getCommonParams()
            // If we have a token set in state, let's assume that we should be passing it.
            if (token) {
                headers.set('authorization', token)
            } else {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/'
            }

            return headers
        },

    });
    return async (args, api, extraOptions) => {
        // --- REQUEST INTERCEPTION (Encryption) ---
        let modifiedArgs = { ...args };
        if (modifiedArgs.body && !(modifiedArgs.body instanceof FormData)) {
            const encryptedStr = encryptData(modifiedArgs.body);
            if (encryptedStr) {
                modifiedArgs.body = { payload: encryptedStr };
            }
        }

        const result = await baseQueryFetch(modifiedArgs, api, extraOptions);
        
        // --- RESPONSE INTERCEPTION (Decryption) ---
        if (result.data && result.data.payload) {
            const decryptedObj = decryptData(result.data.payload);
            if (decryptedObj) {
                result.data = decryptedObj;
            }
        }

        if (result.error && result.error.originalStatus === 401) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/'
            return
        }
        return result;
    };
};

export default baseQuery();