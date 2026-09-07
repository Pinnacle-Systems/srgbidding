import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { GSM_API } from "../../Api";


const GsmMasterApi = createApi({
    reducerPath: "GsmMaster",
    baseQuery: baseQuery,
    tagTypes: ["GsmMaster"],
    endpoints: (builder) => ({
        getGsmMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: GSM_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: GSM_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["GsmMaster"],
        }),
        getGsmMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${GSM_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["GsmMaster"],
        }),
        addGsmMaster: builder.mutation({
            query: (payload) => ({
                url: GSM_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["GsmMaster"],
        }),
        updateGsmMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${GSM_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["GsmMaster"],
        }),
        deleteGsmMaster: builder.mutation({
            query: (id) => ({
                url: `${GSM_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["GsmMaster"],
        }),
    }),
});

export const {
    useGetGsmMasterQuery,
    useGetGsmMasterByIdQuery,
    useLazyGetGsmMasterByIdQuery,
    useAddGsmMasterMutation,
    useUpdateGsmMasterMutation,
    useDeleteGsmMasterMutation,
} = GsmMasterApi;

export default GsmMasterApi;