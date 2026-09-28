import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { FABRIC_API } from "../../Api";

const FabricMasterApi = createApi({
    reducerPath: "fabricMaster",
    baseQuery: baseQuery,
    tagTypes: ["FabricMaster"],
    endpoints: (builder) => ({
        getFabricMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: FABRIC_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: FABRIC_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["FabricMaster"],
        }),
        getFabricMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${FABRIC_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["FabricMaster"],
        }),
        addFabricMaster: builder.mutation({
            query: (payload) => ({
                url: FABRIC_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["FabricMaster"],
        }),
        updateFabricMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${FABRIC_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["FabricMaster"],
        }),
        deleteFabricMaster: builder.mutation({
            query: (id) => ({
                url: `${FABRIC_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FabricMaster"],
        }),
    }),
});

export const {
    useGetFabricMasterQuery,
    useGetFabricMasterByIdQuery,
    useLazyGetFabricMasterByIdQuery,
    useAddFabricMasterMutation,
    useUpdateFabricMasterMutation,
    useDeleteFabricMasterMutation,
} = FabricMasterApi;

export default FabricMasterApi;
