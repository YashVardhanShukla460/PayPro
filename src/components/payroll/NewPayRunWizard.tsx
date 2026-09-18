import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Modal } from '../common/Modal';
import { Search, CheckSquare, Square, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface NewPayRunWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPayRunWizard: React.FC<NewPayRunWizardProps> = ({ isOpen, onClose }) => {
  const { employees, salaryStructures, createNewPayRun, getActiveContract } = usePayroll();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Payroll Setup
  const [period, setPeriod] = useState('October 2026');
  const [salaryStructureId, setSalaryStructureId] = useState(salaryStructures[0]?.id || 'struct-reg-01');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [payDate, setPayDate] = useState('2026-10-31');

  // Step 2: Employee Selection
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>(employees.map((e) => e.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleToggleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleToggleEmployee = (id: string) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedEmpIds((prev) => [...prev, id]);
    }
  };

  const handleCreate = () => {
    if (selectedEmpIds.length === 0) return;
    createNewPayRun({
      period,
      startDate,
      endDate,
      payDate,
      salaryStructureId,
      employeeIds: selectedEmpIds,
    });
    onClose();
    // reset state
    setStep(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Pay Run"
      subtitle="Configure payroll cycle rules and cohort selection"
      maxWidth="2xl"
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-[#E2E4DE] pb-4 mb-5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step === 1 ? 'bg-[#1B4332] text-white' : 'bg-[#EAF2EC] text-[#1B4332]'
            }`}
          >
            1
          </span>
          <span className={`font-semibold ${step === 1 ? 'text-[#18191B]' : 'text-[#5F6773]'}`}>
            Payroll Setup
          </span>
        </div>
        <div className="w-12 h-[1px] bg-[#E2E4DE]" />
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step === 2 ? 'bg-[#1B4332] text-white' : 'bg-[#F4F4F0] text-[#5F6773]'
            }`}
          >
            2
          </span>
          <span className={`font-semibold ${step === 2 ? 'text-[#18191B]' : 'text-[#5F6773]'}`}>
            Employee Cohort Selection
          </span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Payroll Period Name</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              placeholder="e.g. October 2026"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#18191B] mb-1">Primary Salary Structure</label>
            <select
              value={salaryStructureId}
              onChange={(e) => setSalaryStructureId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs bg-white focus:outline-none focus:border-[#1B4332]"
            >
              {salaryStructures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Disbursement Date</label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#F4F4F0] border border-[#E2E4DE] rounded text-xs space-y-1">
            <span className="font-semibold text-[#18191B]">Rule execution note:</span>
            <p className="text-[#5F6773]">
              Creating this pay run will calculate statutory deductions (EPF 12%, PT ₹200, TDS brackets)
              and reconcile unpaid leaves automatically from the attendance registry.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white font-semibold rounded hover:bg-[#143427] transition-colors"
            >
              <span>Continue to Cohort Selection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-xs">
          {/* Filter and Selection Header */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8A92A0] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter cohort by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#E2E4DE] rounded text-xs bg-white focus:outline-none"
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

          {/* Batch toggle bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#FBFBF9] border border-[#E2E4DE] rounded font-medium">
            <button
              onClick={handleToggleSelectAll}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#18191B] hover:text-[#1B4332]"
            >
              {selectedEmpIds.length === filteredEmployees.length ? (
                <CheckSquare className="w-4 h-4 text-[#1B4332]" />
              ) : (
                <Square className="w-4 h-4 text-[#8A92A0]" />
              )}
              <span>Select All Displayed ({filteredEmployees.length})</span>
            </button>
            <span className="text-xs font-bold text-[#1B4332]">
              Selected: {selectedEmpIds.length} employees
            </span>
          </div>

          {/* Employee list checkboxes */}
          <div className="max-h-60 overflow-y-auto border border-[#E2E4DE] rounded divide-y divide-[#E2E4DE]">
            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmpIds.includes(emp.id);
              const activeContract = getActiveContract(emp.id);

              return (
                <div
                  key={emp.id}
                  onClick={() => handleToggleEmployee(emp.id)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer hover:bg-[#F9FAF8] transition-colors ${
                    isSelected ? 'bg-[#EAF2EC]/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#1B4332] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8A92A0] shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-[#18191B] flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        <span className="font-mono text-[10px] text-[#5F6773]">({emp.id})</span>
                      </div>
                      <div className="text-[11px] text-[#5F6773]">
                        {emp.jobTitle} • {emp.department}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-[#18191B] tabular-nums">
                      {activeContract ? formatINR(activeContract.monthlySalary) : '₹40,000'}/mo
                    </span>
                    <span className="block text-[10px] text-[#5F6773]">Base CTC</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E2E4DE]">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#5F6773] hover:text-[#18191B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Setup</span>
            </button>
            <button
              onClick={handleCreate}
              disabled={selectedEmpIds.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded text-white transition-colors ${
                selectedEmpIds.length > 0
                  ? 'bg-[#1B4332] hover:bg-[#143427]'
                  : 'bg-[#D2E3D6] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Pay Run ({selectedEmpIds.length} Selected)</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
