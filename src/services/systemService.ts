import api from "./api";

export interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  services: {
    database: { status: string; responseTime: number; details: any };
    redis: { status: string; responseTime: number; details: any };
    kcb: { status: string; responseTime: number; details: any };
    sms: { status: string; responseTime: number; details: any };
    email?: { status: string; responseTime: number; details: any };
    queues: { status: string; details: any };
  };
  timestamp: string;
}

export interface SystemMetrics {
  system: {
    cpu: number;
    memory: { used: number; total: number; percentage: string };
    process: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    uptime: { seconds: number; formatted: string };
  };
  database: { dialect: string; poolSize: number };
  queues: {
    webhooks: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    settlements: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    payouts: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
  timestamp: string;
}

export interface DatabaseStats {
  counts: {
    members: number;
    agents: number;
    superAgents: number;
    activeSubscriptions: number;
    pendingPayments: number;
  };
  recentSubscriptions: any[];
  timestamp: string;
}

export interface QueueStats {
  webhooks: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  settlements: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  payouts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  reconciliation: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  timestamp: string;
}

export interface ApplicationMetrics {
  payments: { today: number; successRate: string; total24h: number };
  recentPayments: any[];
  settlements: { active: number; recent: any[] };
  commissions: { totalAgent: number };
  timestamp: string;
}

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get("/system/health");
  return response.data;
};

/**
 * Get real-time system metrics
 */
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await api.get("/system/metrics");
  return response.data;
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  const response = await api.get("/system/database");
  return response.data;
};

/**
 * Get queue statistics
 */
export const getQueueStats = async (): Promise<QueueStats> => {
  const response = await api.get("/system/queues");
  return response.data;
};

/**
 * Get application metrics
 */
export const getApplicationMetrics = async (): Promise<ApplicationMetrics> => {
  const response = await api.get("/system/application");
  return response.data;
};

/**
 * Clear Redis cache
 */
export const clearCache = async (): Promise<any> => {
  const response = await api.post("/system/cache/clear");
  return response.data;
};

/**
 * Test KCB connection
 */
export const testKCBConnection = async (): Promise<any> => {
  const response = await api.post("/system/test/kcb");
  return response.data;
};

/**
 * Test SMS service
 */
export const testSMSService = async (phone?: string): Promise<any> => {
  const response = await api.post("/system/test/sms", { phone });
  return response.data;
};

/**
 * Test Email service
 */
export const testEmailService = async (email?: string): Promise<any> => {
  const response = await api.post("/system/test/email", { email });
  return response.data;
};

export default {
  getSystemHealth,
  getSystemMetrics,
  getDatabaseStats,
  getQueueStats,
  getApplicationMetrics,
  clearCache,
  testKCBConnection,
  testSMSService,
  testEmailService,
};
