import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { NOTIFICATION_API } from "../../Api";


const NotificationApi = createApi({
  reducerPath: "notification",
  baseQuery: baseQuery,
  tagTypes: ["notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: NOTIFICATION_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: NOTIFICATION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["notification"],
    }),

    markPendingJobCardAsRead: builder.mutation({
      query: ({ id }) => ({
        url: `${NOTIFICATION_API}/markAsRead/${id}`,
        method: "PUT",
      }),

      invalidatesTags: ["notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkPendingJobCardAsReadMutation } =
  NotificationApi;

export default NotificationApi;
