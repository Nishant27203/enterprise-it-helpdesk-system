import * as ticketService from '../services/ticketService.js';
import { parseListFilters } from '../validators/ticketValidators.js';

export const create = async (req, res) => {
  const ticket = await ticketService.createTicket(req.user, req.validated.body);
  res.status(201).json({ success: true, data: ticket });
};

export const list = async (req, res) => {
  const filters = parseListFilters(req.validated.query);
  const result = await ticketService.listTickets(req.user, filters);
  res.json({ success: true, data: result.tickets, meta: result.meta });
};

export const getById = async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id, req.user);
  res.json({ success: true, data: ticket });
};

export const update = async (req, res) => {
  const ticket = await ticketService.updateTicket(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: ticket });
};

export const accept = async (req, res) => {
  const ticket = await ticketService.acceptTicket(req.params.id, req.user);
  res.json({ success: true, data: ticket });
};

export const assign = async (req, res) => {
  const ticket = await ticketService.assignTicket(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: ticket });
};

export const changeStatus = async (req, res) => {
  const ticket = await ticketService.changeStatus(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: ticket });
};

export const addComment = async (req, res) => {
  const comment = await ticketService.addComment(req.params.id, req.user, req.validated.body);
  res.status(201).json({ success: true, data: comment });
};

export const getComments = async (req, res) => {
  const comments = await ticketService.getComments(req.params.id, req.user);
  res.json({ success: true, data: comments });
};

export const escalate = async (req, res) => {
  const ticket = await ticketService.escalateTicket(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: ticket });
};

export const resolve = async (req, res) => {
  const ticket = await ticketService.resolveTicket(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: ticket });
};

export const close = async (req, res) => {
  const ticket = await ticketService.closeTicket(req.params.id, req.user);
  res.json({ success: true, data: ticket });
};

export const feedback = async (req, res) => {
  const ticket = await ticketService.submitFeedback(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data: ticket });
};

export const history = async (req, res) => {
  await ticketService.getTicketById(req.params.id, req.user);
  const entries = await ticketService.getTicketHistory(req.params.id);
  res.json({ success: true, data: entries });
};
