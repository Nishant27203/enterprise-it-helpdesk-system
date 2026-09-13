import * as dashboardService from '../services/dashboardService.js';

export const stats = async (_req, res) => {
  const data = await dashboardService.getDashboardStats();
  res.json({ success: true, data });
};

export const chartStatus = async (_req, res) => {
  const data = await dashboardService.getChartByStatus();
  res.json({ success: true, data });
};

export const chartPriority = async (_req, res) => {
  const data = await dashboardService.getChartByPriority();
  res.json({ success: true, data });
};

export const chartCategory = async (_req, res) => {
  const data = await dashboardService.getChartByCategory();
  res.json({ success: true, data });
};

export const chartDepartment = async (_req, res) => {
  const data = await dashboardService.getChartByDepartment();
  res.json({ success: true, data });
};

export const chartTechnician = async (_req, res) => {
  const data = await dashboardService.getChartByTechnician();
  res.json({ success: true, data });
};

export const reports = async (_req, res) => {
  const data = await dashboardService.getReports();
  res.json({ success: true, data });
};
