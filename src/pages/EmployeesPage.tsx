import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import type { Department, EmploymentStatus, EmploymentType } from '../types';
import {
  Search,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  Mail,
  Phone,
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { employees, getActiveContract, setActiveView, addEmployee } = usePayroll();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Add Employee Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time');
  const [joinedDate, setJoinedDate] = useState('2026-09-01');
  const [monthlySalary, setMonthlySalary] = useState(45000);
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || emp.employmentStatus === statusFilter;
    const matchesType = typeFilter === 'All' || emp.employmentType === typeFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !jobTitle) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    addEmployee({
      name,
      email,
      phone,
      avatarInitials: initials,
      jobTitle,
      department,
      employmentStatus: 'Active',
      employmentType,
      joinedDate,
      manager: 'Sunita Rao (VP of People)',
      bankDetails: {
        accountNumber: bankAccount,
        ifscCode: bankIfsc,
        bankName: bankAccount ? 'HDFC Bank' : '',
        isVerified: !!bankAccount,
      },
      panNumber: 'ABCDE1234F',
      pfNumber: 'KN/BLR/0048912/000/9999',
      uan: '100948129999',
      activeContractId: 'CTR-TEMP',
      taxRegime: 'New',
      location: 'Bengaluru (HQ)',
    });

    setIsAddModalOpen(false);
    // Reset form
    setName('');
    setEmail('');
    setJobTitle('');
    setBankAccount('');
    setBankIfsc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Area: Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Workforce Directory
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">Employees</h1>
            <span className="text-xs text-[#5F6773] flex items-center gap-1.5">
              <span className="font-semibold text-[#18191B] font-mono text-sm">142</span> people active
              • {filteredEmployees.length} matching filters
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Structured Controls Bar */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-3.5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8A92A0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, title, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#5F6773]" />
            <span className="text-[#5F6773] font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Product">Product</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#5F6773] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Notice Period">Notice Period</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#5F6773] font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-density Structured Directory List */}
      <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden">
        {/* Table/List Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#E2E4DE] bg-[#FBFBF9] text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
          <div className="col-span-12 sm:col-span-4">Employee & Designation</div>
          <div className="hidden sm:block sm:col-span-2">Department</div>
          <div className="hidden sm:block sm:col-span-2">Status</div>
          <div className="hidden sm:block sm:col-span-2">Active Contract</div>
          <div className="hidden sm:block sm:col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E2E4DE]">
          {filteredEmployees.map((emp) => {
            const activeContract = getActiveContract(emp.id);
            const isBankMissing = !emp.bankDetails?.accountNumber || !emp.bankDetails?.isVerified;

            return (
              <div
                key={emp.id}
                onClick={() => setActiveView('employee-detail', emp.id)}
                className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[#F9FAF8] cursor-pointer transition-colors group"
              >
                {/* Col 1: Avatar, Name, Title, ID */}
                <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {emp.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#18191B] group-hover:text-[#1B4332] transition-colors truncate">
                        {emp.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#5F6773] bg-[#F4F4F0] px-1.5 py-0.2 rounded shrink-0">
                        {emp.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5F6773] truncate">{emp.jobTitle}</div>
                  </div>
                </div>

                {/* Col 2: Department */}
                <div className="hidden sm:block sm:col-span-2 text-xs text-[#2D3139]">
                  {emp.department}
                </div>

                {/* Col 3: Status */}
                <div className="hidden sm:block sm:col-span-2">
                  <div className="flex flex-col gap-1 items-start">
                    <StatusBadge status={emp.employmentStatus} />
                    {isBankMissing && (
                      <span className="text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.2 rounded border border-[#FDE68A]">
                        No Bank Info
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 4: Active Contract */}
                <div className="hidden sm:block sm:col-span-2 text-xs">
                  {activeContract ? (
                    <div>
                      <span className="font-mono font-bold text-[#18191B] tabular-nums">
                        {formatINR(activeContract.monthlySalary)}
                      </span>
                      <span className="text-[11px] text-[#5F6773]"> / mo</span>
                      <div className="text-[10px] text-[#5F6773]">{activeContract.jobTitle}</div>
                    </div>
                  ) : (
                    <span className="text-[#8A92A0] italic">No active contract</span>
                  )}
                </div>

                {/* Col 5: Actions */}
                <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2 mt-2 sm:mt-0">
                  <span className="text-[11px] font-semibold text-[#1B4332] group-hover:underline inline-flex items-center gap-1">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center text-xs text-[#5F6773]">
              No employees match the applied filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="Create an employee profile and register onboarding details"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Work Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="v.singhania@peoplepay360.internal"
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Official Job Title *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-2.5 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Product">Product</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-2.5 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Joined Date</label>
              <input
                type="date"
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full px-2.5 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Banking Details */}
          <div className="pt-2 border-t border-[#E2E4DE]">
            <div className="font-semibold text-[#18191B] mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Banking & Disbursal Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5F6773] mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 50100481920194"
                  className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
                />
              </div>
              <div>
                <label className="block text-[#5F6773] mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0000240"
                  className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-[#5F6773] hover:text-[#18191B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143427] rounded transition-colors"
            >
              Save & Onboard Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
