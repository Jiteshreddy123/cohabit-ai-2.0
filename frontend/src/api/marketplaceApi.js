import apiClient from "./apiClient";

export const marketplaceApi = {
  /** Get all available listings on the student's campus */
  getListings: (params = {}) =>
    apiClient.get("/marketplace", { params }).then((r) => r.data),

  /** Create a new listing */
  createListing: (data) =>
    apiClient.post("/marketplace", data).then((r) => r.data),

  /** Update an existing listing (owner only) */
  updateListing: (id, data) =>
    apiClient.put(`/marketplace/${id}`, data).then((r) => r.data),

  /** Mark a listing as sold */
  markSold: (id) =>
    apiClient.post(`/marketplace/${id}/mark-sold`).then((r) => r.data),

  /** Soft-delete (remove) a listing */
  deleteListing: (id) =>
    apiClient.delete(`/marketplace/${id}`).then((r) => r.data),
};
