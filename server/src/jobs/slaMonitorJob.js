import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { getSlaStatus } from '../services/slaService.js';
import { createHistory } from '../services/historyService.js';
import {
  createNotification,
  hasRecentNotification,
  hasSlaBreachHistory,
} from '../services/notificationService.js';

export const runSlaCheck = async () => {
  const activeTickets = await prisma.ticket.findMany({
    where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
    include: {
      assignedTo: { select: { id: true } },
      requester: { select: { id: true } },
    },
  });

  for (const ticket of activeTickets) {
    const slaStatus = getSlaStatus(ticket);

    if (slaStatus === 'AT_RISK') {
      const notifyIds = [
        ticket.assignedToId,
        ticket.requesterId,
      ].filter(Boolean);

      for (const userId of notifyIds) {
        const recent = await hasRecentNotification(
          ticket.id,
          userId,
          'SLA_APPROACHING',
          60
        );
        if (!recent) {
          await createNotification(null, {
            userId,
            ticketId: ticket.id,
            type: 'SLA_APPROACHING',
            title: 'SLA At Risk',
            message: `${ticket.ticketNumber} resolution SLA is at risk`,
          });
        }
      }
    }

    if (slaStatus === 'BREACHED') {
      const alreadyLogged = await hasSlaBreachHistory(ticket.id);

      if (!alreadyLogged) {
        await createHistory(null, {
          ticketId: ticket.id,
          actorId: ticket.assignedToId || ticket.requesterId,
          action: 'SLA_BREACHED',
          metadata: { slaResolutionDue: ticket.slaResolutionDue },
        });
      }

      const notifyIds = [
        ticket.assignedToId,
        ticket.requesterId,
      ].filter(Boolean);

      for (const userId of notifyIds) {
        const recent = await hasRecentNotification(
          ticket.id,
          userId,
          'SLA_BREACHED',
          120
        );
        if (!recent) {
          await createNotification(null, {
            userId,
            ticketId: ticket.id,
            type: 'SLA_BREACHED',
            message: `${ticket.ticketNumber} resolution SLA has been breached`,
            title: 'SLA Breached',
          });
        }
      }
    }
  }
};

export const startSlaMonitor = () => {
  cron.schedule(env.SLA_CHECK_INTERVAL_CRON, async () => {
    try {
      await runSlaCheck();
    } catch (error) {
      console.error('SLA monitor error:', error);
    }
  });
  console.log(`SLA monitor scheduled: ${env.SLA_CHECK_INTERVAL_CRON}`);
};
