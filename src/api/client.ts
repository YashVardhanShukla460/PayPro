/**
 * PeoplePay360 Live API Client connected to SQLite database backend
 */

const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('peoplepay360_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('peoplepay360_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('peoplepay360_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { email: string; password: string; name: string; role?: string }) =>
      request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request<any>('/auth/me'),
  },

  // Employees
  employees: {
    getAll: () => request<any[]>('/employees'),
    create: (data: any) =>
      request<any>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateBank: (id: string, bankDetails: any) =>
      request<any>(`/employees/${id}/bank`, {
        method: 'PATCH',
        body: JSON.stringify(bankDetails),
      }),
  },

  // Contracts
  contracts: {
    getAll: () => request<any[]>('/contracts'),
    renew: (data: { employeeId: string; monthlySalary: number; startDate: string; endDate: string }) =>
      request<any>('/contracts/renew', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Attendance
  attendance: {
    getAll: () => request<any[]>('/attendance'),
    checkIn: (employeeId: string, status = 'Present') =>
      request<any>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ employeeId, status }),
      }),
    reconcile: (id: string, data: { status: string; checkIn: string; checkOut: string }) =>
      request<any>(`/attendance/${id}/reconcile`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Time Off
  timeOff: {
    getAll: () => request<{ requests: any[]; balances: Record<string, any> }>('/timeoff'),
    request: (data: any) =>
      request<any>('/timeoff/request', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: 'Approved' | 'Refused') =>
      request<any>(`/timeoff/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Salary Rules
  salaryRules: {
    getAll: () => request<any[]>('/salary-rules'),
    updateRule: (ruleId: string, expression: string) =>
      request<any>(`/salary-rules/rule/${ruleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ expression }),
      }),
  },

  // Pay Runs
  payruns: {
    getAll: () => request<any[]>('/payruns'),
    create: (data: any) =>
      request<{ id: string }>('/payruns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    compute: (id: string) =>
      request<any>(`/payruns/${id}/compute`, {
        method: 'POST',
      }),
    validate: (id: string) =>
      request<any>(`/payruns/${id}/validate`, {
        method: 'POST',
      }),
    pay: (id: string) =>
      request<any>(`/payruns/${id}/pay`, {
        method: 'POST',
      }),
  },
};
