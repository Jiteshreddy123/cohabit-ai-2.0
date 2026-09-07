import apiClient from "./apiClient";

export const microGigApi = {
  /** Get all open, non-expired gigs on the student's campus */
  getGigs: (params = {}) =>
    apiClient.get("/micro-gigs", { params }).then((r) => r.data),

  /** Get gigs posted by the current student */
  getMyGigs: () =>
    apiClient.get("/micro-gigs/my").then((r) => r.data),

  /** Post a new micro-gig (auto-expires in 48 hours) */
  createGig: (data) =>
    apiClient.post("/micro-gigs", data).then((r) => r.data),

  /** Accept an open gig */
  acceptGig: (id) =>
    apiClient.post(`/micro-gigs/${id}/accept`).then((r) => r.data),

  /** Delete / cancel a gig (poster only) */
  deleteGig: (id) =>
    apiClient.delete(`/micro-gigs/${id}`).then((r) => r.data),
};
