import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-hot-toast";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://library-7qme.onrender.com/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenantId");
    const role = localStorage.getItem("role");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (tenantId && role !== "super_admin") {
      headers.set("x-tenant-id", tenantId);
    }

    return headers;
  },
});

const baseQueryWithGlobalHandle = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const { status, data } = result.error;

    switch (status) {
      case 401:
        if (!window.location.pathname.includes("/login")) {
          localStorage.clear();
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        }
        break;

      case 403:
        toast.error("Access Denied: You do not have permission");
        break;

      case 500:
        if (data?.message) {
          toast.error(data.message);
        } else {
          toast.error("Server error: Something went wrong on our end");
        }
        break;

      case 400:
        toast.error(data?.message || "Invalid request");
        break;

      case "FETCH_ERROR":
        toast.error("Network Error: Please check your internet connection");
        break;

      default:
        const message = data?.message || "An unexpected error occurred";
        if (status !== 404) {
          toast.error(message);
        }
    }
  }

  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithGlobalHandle,
  tagTypes: [
    "Auth",
    "User",
    "Books",
    "Borrowing",
    "Students",
    "Membership",
    "StudyDesk",
    "Finance",
    "DigitalLibrary",
    "Events",
    "Notifications",
    "Settings",
    "Dashboard",
    "Admin",
  ],
  endpoints: () => ({}),
});
