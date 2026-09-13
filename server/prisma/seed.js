import {
  PrismaClient,
  Role,
  Priority,
  EscalationLevel,
  TicketStatus,
  HistoryAction,
  NotificationType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo@123';

const departments = [
  { name: 'IT', description: 'Information Technology' },
  { name: 'HR', description: 'Human Resources' },
  { name: 'Finance', description: 'Finance and Accounting' },
  { name: 'Sales', description: 'Sales Department' },
  { name: 'Operations', description: 'Operations and Logistics' },
  { name: 'Marketing', description: 'Marketing and Communications' },
];

const categories = [
  { name: 'Hardware', description: 'Physical equipment issues', subcategories: ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Printer'] },
  { name: 'Software', description: 'Application and OS issues', subcategories: ['Windows', 'Outlook', 'Microsoft Teams', 'Excel', 'Antivirus'] },
  { name: 'Network', description: 'Connectivity and network issues', subcategories: ['Wi-Fi', 'VPN', 'Internet', 'DNS'] },
  { name: 'Access', description: 'Account and permission issues', subcategories: ['Password Reset', 'Account Locked', 'Shared Folder', 'Application Access'] },
];

const slaPolicies = [
  { priority: Priority.CRITICAL, responseTimeMinutes: 15, resolutionTimeMinutes: 120 },
  { priority: Priority.HIGH, responseTimeMinutes: 30, resolutionTimeMinutes: 240 },
  { priority: Priority.MEDIUM, responseTimeMinutes: 120, resolutionTimeMinutes: 480 },
  { priority: Priority.LOW, responseTimeMinutes: 240, resolutionTimeMinutes: 1440 },
];

const knowledgeArticles = [
  {
    title: 'Outlook not syncing',
    tags: ['outlook', 'email', 'sync'],
    problem: 'Outlook calendar and emails are not syncing with the Exchange server. Users see "Need Password" or items remain in Outbox.',
    troubleshootingSteps: '1. Check internet connectivity.\n2. Verify credentials in Account Settings.\n3. Run Outlook in Safe Mode (outlook.exe /safe).\n4. Disable add-ins one by one.\n5. Create a new Outlook profile.\n6. Repair Office installation.',
    resolution: 'Most cases resolved by creating a new Outlook profile or re-entering credentials. If persistent, re-provision the mailbox from Exchange admin center.',
  },
  {
    title: 'VPN connection failure',
    tags: ['vpn', 'network', 'remote'],
    problem: 'User cannot connect to corporate VPN. Error messages include "Connection timed out" or "Authentication failed".',
    troubleshootingSteps: '1. Verify username format (domain\\username).\n2. Check if MFA token is current.\n3. Confirm VPN client version is up to date.\n4. Test from a different network.\n5. Check firewall allows UDP 500/4500.\n6. Review VPN gateway status.',
    resolution: 'Update VPN client to latest version. Reset MFA if authentication fails. For timeout errors, check home router/firewall settings blocking VPN protocols.',
  },
  {
    title: 'Windows password reset',
    tags: ['password', 'access', 'windows'],
    problem: 'User forgot Windows/domain password and cannot log in to their workstation.',
    troubleshootingSteps: '1. Verify user identity per company policy.\n2. Reset password in Active Directory.\n3. Ensure "User must change password at next logon" if required.\n4. Check account is not locked.\n5. Confirm password meets complexity requirements.',
    resolution: 'Reset AD password via IT admin tools. User logs in with temporary password and sets a new one. Unlock account if locked due to failed attempts.',
  },
  {
    title: 'Printer not responding',
    tags: ['printer', 'hardware'],
    problem: 'Network printer shows offline or jobs stuck in print queue. Users cannot print documents.',
    troubleshootingSteps: '1. Check printer power and network cable.\n2. Restart print spooler service.\n3. Clear stuck print jobs.\n4. Remove and re-add printer.\n5. Update printer driver.\n6. Ping printer IP address.',
    resolution: 'Restart print spooler and clear queue. Reinstall printer driver if needed. For network printers, verify IP reservation and VLAN access.',
  },
  {
    title: 'Wi-Fi connectivity issue',
    tags: ['wifi', 'network'],
    problem: 'User experiences intermittent Wi-Fi drops or cannot connect to corporate wireless network.',
    troubleshootingSteps: '1. Forget and reconnect to SSID.\n2. Update Wi-Fi adapter driver.\n3. Check signal strength near AP.\n4. Disable power saving on adapter.\n5. Run network troubleshooter.\n6. Test with ethernet to isolate issue.',
    resolution: 'Update wireless adapter driver. Move closer to access point or report dead zone to network team. For certificate issues, redeploy Wi-Fi profile via MDM.',
  },
  {
    title: 'Account locked',
    tags: ['account', 'access', 'locked'],
    problem: 'User account locked after multiple failed login attempts. Cannot access email, VPN, or workstation.',
    troubleshootingSteps: '1. Verify user identity.\n2. Check lockout source (AD, VPN, application).\n3. Unlock account in Active Directory.\n4. Review recent login attempts in SIEM.\n5. Confirm user knows correct password.\n6. Check for stale mobile device sessions.',
    resolution: 'Unlock AD account. Educate user on password policy. If repeated lockouts, investigate potential credential stuffing or misconfigured service account using user credentials.',
  },
  {
    title: 'Shared folder access denied',
    tags: ['access', 'shared folder', 'permissions'],
    problem: 'User receives "Access Denied" when trying to open a network shared folder (e.g., \\\\fileserver\\department).',
    troubleshootingSteps: '1. Verify user is in correct AD security group.\n2. Check NTFS and share permissions.\n3. Confirm user is on corporate network or VPN.\n4. Test with "net use" command.\n5. Review group policy drive mappings.\n6. Check if folder moved or renamed.',
    resolution: 'Add user to appropriate AD group and allow 15 minutes for replication. Run gpupdate /force on user machine. Verify share permissions inherit correctly.',
  },
];

async function seedBase() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const dept of departments) {
    await prisma.department.upsert({ where: { name: dept.name }, update: {}, create: dept });
  }

  const deptMap = Object.fromEntries((await prisma.department.findMany()).map((d) => [d.name, d.id]));

  const catMap = {};
  const subMap = {};
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, description: cat.description },
    });
    catMap[cat.name] = category.id;
    for (const subName of cat.subcategories) {
      const sub = await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: category.id, name: subName } },
        update: {},
        create: { name: subName, categoryId: category.id },
      });
      subMap[`${cat.name}/${subName}`] = sub.id;
    }
  }

  for (const policy of slaPolicies) {
    await prisma.sLAPolicy.upsert({
      where: { priority: policy.priority },
      update: policy,
      create: policy,
    });
  }

  const slaMap = Object.fromEntries((await prisma.sLAPolicy.findMany()).map((s) => [s.priority, s]));

  const users = [
    { email: 'employee@company.com', firstName: 'Sarah', lastName: 'Johnson', role: Role.EMPLOYEE, departmentId: deptMap.Sales },
    { email: 'tech.l1@company.com', firstName: 'Mike', lastName: 'Chen', role: Role.IT_TECHNICIAN, departmentId: deptMap.IT, escalationLevel: EscalationLevel.L1 },
    { email: 'tech.l2@company.com', firstName: 'Emily', lastName: 'Rodriguez', role: Role.IT_TECHNICIAN, departmentId: deptMap.IT, escalationLevel: EscalationLevel.L2 },
    { email: 'manager@company.com', firstName: 'David', lastName: 'Thompson', role: Role.IT_MANAGER, departmentId: deptMap.IT, escalationLevel: EscalationLevel.L2 },
    { email: 'admin@company.com', firstName: 'Lisa', lastName: 'Anderson', role: Role.ADMIN, departmentId: deptMap.IT },
  ];

  const userMap = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, ...u },
      create: { ...u, passwordHash },
    });
    userMap[u.email] = user;
  }

  return { deptMap, catMap, subMap, slaMap, userMap };
}

function slaDates(policy, hoursAgo = 0) {
  const created = new Date(Date.now() - hoursAgo * 3600000);
  return {
    createdAt: created,
    slaResponseDue: new Date(created.getTime() + policy.responseTimeMinutes * 60000),
    slaResolutionDue: new Date(created.getTime() + policy.resolutionTimeMinutes * 60000),
  };
}

async function seedTickets(ctx) {
  const { deptMap, subMap, slaMap, userMap } = ctx;
  const employee = userMap['employee@company.com'];
  const techL1 = userMap['tech.l1@company.com'];
  const techL2 = userMap['tech.l2@company.com'];
  const manager = userMap['manager@company.com'];

  await prisma.ticketCounter.upsert({
    where: { year: 2026 },
    update: { lastNumber: 8 },
    create: { year: 2026, lastNumber: 8 },
  });

  const ticketDefs = [
    {
      num: 'INC-2026-00001', title: 'Laptop not powering on after Windows update',
      desc: 'My Dell Latitude laptop shut down during a Windows update overnight. Now it will not power on — no lights, no fan. Tried holding power button for 30 seconds.',
      cat: 'Hardware/Laptop', priority: Priority.HIGH, status: TicketStatus.IN_PROGRESS,
      assignee: techL1.id, level: EscalationLevel.L1, hoursAgo: 6,
      troubleshooting: 'Checked power adapter — LED on adapter is lit. Removed battery, held power 30s, reconnected — no change. Connected to dock — still no power.',
    },
    {
      num: 'INC-2026-00002', title: 'Outlook calendar not syncing with Teams',
      desc: 'Calendar events created in Outlook do not appear in Microsoft Teams and vice versa. Last sync was 3 days ago.',
      cat: 'Software/Outlook', priority: Priority.MEDIUM, status: TicketStatus.PENDING_USER,
      assignee: techL1.id, level: EscalationLevel.L1, hoursAgo: 12,
      troubleshooting: 'Verified Outlook is connected to Exchange. Ran /safe mode — issue persists. Checked Teams calendar settings.',
    },
    {
      num: 'INC-2026-00003', title: 'VPN disconnects every 15 minutes',
      desc: 'When working remotely, VPN connection drops exactly every 15 minutes. I have to reconnect constantly which disrupts my work.',
      cat: 'Network/VPN', priority: Priority.HIGH, status: TicketStatus.ASSIGNED,
      assignee: techL1.id, level: EscalationLevel.L1, hoursAgo: 3,
    },
    {
      num: 'INC-2026-00004', title: 'Account locked after failed login attempts',
      desc: 'I entered my password incorrectly several times this morning. Now my account is locked and I cannot log in to my PC, email, or VPN.',
      cat: 'Access/Account Locked', priority: Priority.CRITICAL, status: TicketStatus.RESOLVED,
      assignee: techL1.id, level: EscalationLevel.L1, hoursAgo: 48,
      resolved: true, resolutionNotes: 'Unlocked AD account and reset password.', rootCause: 'User exceeded failed login threshold (5 attempts).',
    },
    {
      num: 'INC-2026-00005', title: 'Printer HP LaserJet offline in Finance department',
      desc: 'The HP LaserJet on the 3rd floor Finance area shows as offline. Multiple team members cannot print expense reports.',
      cat: 'Hardware/Printer', priority: Priority.LOW, status: TicketStatus.OPEN,
      assignee: null, level: EscalationLevel.L1, hoursAgo: 2,
    },
    {
      num: 'INC-2026-00006', title: 'Cannot access shared folder \\\\fileserver\\HR',
      desc: 'Getting "Access Denied" when opening the HR shared folder. I was added to the HR-Files group yesterday but still cannot access.',
      cat: 'Access/Shared Folder', priority: Priority.MEDIUM, status: TicketStatus.ESCALATED,
      assignee: techL2.id, level: EscalationLevel.L2, hoursAgo: 24,
      troubleshooting: 'Verified user is in HR-Files AD group. Checked share permissions — group has Read/Write. GPO mapping exists.',
    },
    {
      num: 'INC-2026-00007', title: 'Wi-Fi drops connection in Conference Room B',
      desc: 'Wi-Fi signal is strong but connection drops every few minutes in Conference Room B. Affects all attendees during meetings.',
      cat: 'Network/Wi-Fi', priority: Priority.HIGH, status: TicketStatus.IN_PROGRESS,
      assignee: techL2.id, level: EscalationLevel.L2, hoursAgo: 8,
      troubleshooting: 'Checked AP status — AP-CB-03 showing intermittent errors. Channel overlap detected with neighboring AP.',
    },
    {
      num: 'INC-2026-00008', title: 'Need access to Salesforce application',
      desc: 'I recently joined the Sales team and need access to Salesforce CRM. My manager approved the request via email.',
      cat: 'Access/Application Access', priority: Priority.MEDIUM, status: TicketStatus.CLOSED,
      assignee: techL1.id, level: EscalationLevel.L1, hoursAgo: 120,
      resolved: true, closed: true,
      resolutionNotes: 'Provisioned Salesforce license and added to Sales-CRM group.',
      rootCause: 'New hire onboarding — standard access provisioning.',
      rating: 5, feedback: 'Quick turnaround, thank you!',
    },
  ];

  for (const def of ticketDefs) {
    const policy = slaMap[def.priority];
    const dates = slaDates(policy, def.hoursAgo);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: def.num,
        title: def.title,
        description: def.desc,
        categoryId: ctx.catMap[def.cat.split('/')[0]],
        subcategoryId: subMap[def.cat],
        priority: def.priority,
        status: def.status,
        requesterId: employee.id,
        departmentId: deptMap.Sales,
        assignedToId: def.assignee,
        escalationLevel: def.level,
        slaPolicyId: policy.id,
        slaResponseDue: dates.slaResponseDue,
        slaResolutionDue: dates.slaResolutionDue,
        firstResponseAt: def.assignee ? new Date(dates.createdAt.getTime() + 20 * 60000) : null,
        resolvedAt: def.resolved ? new Date(Date.now() - 3600000) : null,
        closedAt: def.closed ? new Date(Date.now() - 1800000) : null,
        resolutionNotes: def.resolutionNotes || null,
        rootCause: def.rootCause || null,
        troubleshootingNotes: def.troubleshooting || null,
        satisfactionRating: def.rating || null,
        feedbackComment: def.feedback || null,
        createdAt: dates.createdAt,
      },
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        actorId: employee.id,
        action: HistoryAction.TICKET_CREATED,
        metadata: { ticketNumber: def.num, priority: def.priority },
        createdAt: dates.createdAt,
      },
    });

    if (def.assignee) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          actorId: manager.id,
          action: HistoryAction.ASSIGNED,
          metadata: { assignedToId: def.assignee },
          createdAt: new Date(dates.createdAt.getTime() + 10 * 60000),
        },
      });
    }

    if (def.status === TicketStatus.ESCALATED) {
      await prisma.escalation.create({
        data: {
          ticketId: ticket.id,
          escalatedById: techL1.id,
          escalatedToId: techL2.id,
          fromLevel: EscalationLevel.L1,
          toLevel: EscalationLevel.L2,
          reason: 'Requires server-side permission review beyond L1 scope',
          notes: 'Verified AD group membership — issue appears to be NTFS inheritance on subfolder.',
        },
      });
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          actorId: techL1.id,
          action: HistoryAction.ESCALATED,
          metadata: { fromLevel: 'L1', toLevel: 'L2' },
        },
      });
    }

    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: employee.id,
        content: `Original request: ${def.desc.substring(0, 150)}...`,
        isInternal: false,
        createdAt: dates.createdAt,
      },
    });

    if (def.assignee) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: techL1.id,
          content: 'Acknowledged. Looking into this now.',
          isInternal: false,
          createdAt: new Date(dates.createdAt.getTime() + 15 * 60000),
        },
      });
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: techL1.id,
          content: def.troubleshooting || 'Initial diagnostics in progress.',
          isInternal: true,
          createdAt: new Date(dates.createdAt.getTime() + 30 * 60000),
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: manager.id,
        ticketId: ticket.id,
        type: NotificationType.TICKET_CREATED,
        title: 'New Ticket',
        message: `${def.num}: ${def.title}`,
        createdAt: dates.createdAt,
      },
    });
  }
}

async function seedKnowledge(ctx) {
  const tech = ctx.userMap['tech.l1@company.com'];
  for (const article of knowledgeArticles) {
    await prisma.knowledgeArticle.create({
      data: {
        ...article,
        categoryId: ctx.catMap.Network || ctx.catMap.Software,
        authorId: tech.id,
      },
    });
  }
}

async function main() {
  console.log('Seeding database...');

  await prisma.ticketComment.deleteMany();
  await prisma.ticketHistory.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.knowledgeArticle.deleteMany();
  await prisma.ticketCounter.deleteMany();

  const ctx = await seedBase();
  await seedTickets(ctx);
  await seedKnowledge(ctx);

  console.log('Seed completed!');
  console.log('Demo credentials (password: Demo@123):');
  console.log('  employee@company.com | tech.l1@company.com | manager@company.com | admin@company.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
