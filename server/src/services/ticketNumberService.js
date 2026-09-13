export const generateTicketNumber = async (tx) => {
  const year = new Date().getFullYear();

  const counter = await tx.ticketCounter.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  const sequence = String(counter.lastNumber).padStart(5, '0');
  return `INC-${year}-${sequence}`;
};
