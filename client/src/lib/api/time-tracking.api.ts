import API from "../axios-client";
import {
  TimeEntryType,
  TimeEntriesResponseType,
  CreateTimeEntryType,
  TimeEntryResponseType,
  TimeReportResponseType,
  TimeEntryFiltersType
} from "@/types/time-tracking.type";

export const getTimeEntriesQueryFn = async (
  workspaceId: string,
  filters?: TimeEntryFiltersType
): Promise<TimeEntriesResponseType> => {
  const params = new URLSearchParams();
  
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  
  if (filters?.userId) {
    params.append('userId', filters.userId);
  }
  
  if (filters?.projectId) {
    params.append('projectId', filters.projectId);
  }
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/time-tracking/${workspaceId}${queryString}`);
  return response.data;
};

export const getTimeEntryByIdQueryFn = async (
  timeEntryId: string
): Promise<TimeEntryResponseType> => {
  const response = await API.get(`/time-tracking/entry/${timeEntryId}`);
  return response.data;
};

export const createTimeEntryMutationFn = async (
  data: CreateTimeEntryType
): Promise<TimeEntryResponseType> => {
  const response = await API.post(`/time-tracking/entry/create`, data);
  return response.data;
};

export const updateTimeEntryMutationFn = async (
  timeEntryId: string,
  data: Partial<TimeEntryType>
): Promise<TimeEntryResponseType> => {
  const response = await API.put(`/time-tracking/entry/${timeEntryId}`, data);
  return response.data;
};

export const deleteTimeEntryMutationFn = async (
  timeEntryId: string
): Promise<{ message: string; timeEntryId: string }> => {
  const response = await API.delete(`/time-tracking/entry/${timeEntryId}`);
  return response.data;
};

export const getTimeReportsQueryFn = async (
  workspaceId: string,
  filters?: TimeEntryFiltersType
): Promise<TimeReportResponseType> => {
  const params = new URLSearchParams();
  
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  
  if (filters?.userId) {
    params.append('userId', filters.userId);
  }
  
  if (filters?.projectId) {
    params.append('projectId', filters.projectId);
  }
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/time-tracking/reports/${workspaceId}${queryString}`);
  return response.data;
};