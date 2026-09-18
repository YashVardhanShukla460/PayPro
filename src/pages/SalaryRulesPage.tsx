import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatINR } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  Sliders,
  Play,
  ArrowRight,
  CheckCircle2,
  Code2,
  Plus,
  HelpCircle,
  FileCode,
} from 'lucide-react';

export const SalaryRulesPage: React.FC = () => {
  const { salaryStructures, updateSalaryRule, addToast } = usePayroll();

  const [selectedStructureId, setSelectedStructureId] = useState(salaryStructures[0]?.id || 'struct-reg-01');
  const [calculatorCtc, setCalculatorCtc] = useState(480000); // 40,000 / month

  // Rule edit modal state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleExpression, setRuleExpression] = useState('');

  const currentStructure =
    salaryStructures.find((s) => s.id === selectedStructureId) || salaryStructures[0];

  // Quick sandbox simulator calculations based on the rules
  const monthlyCtc = Math.round(calculatorCtc / 12);
  const simulatedBasic = Math.round(monthlyCtc * 0.5);
  const simulatedHra = Math.round(monthlyCtc * 0.25);
  const simulatedTransport = 3200;
  const simulatedSpecial = Math.max(0, monthlyCtc - (simulatedBasic + simulatedHra + simulatedTransport));
  const simulatedGross = monthlyCtc;
  const simulatedPf = Math.min(Math.round(simulatedBasic * 0.12), 3600);
  const simulatedPt = 200;
  const simulatedTds = Math.round(monthlyCtc * 12 > 1000000 ? 5000 : 2000);
  const simulatedNet = simulatedGross - (simulatedPf + simulatedPt + simulatedTds);

  const handleOpenEditRule = (ruleId: string, currentExp: string) => {
    setEditingRuleId(ruleId);
    setRuleExpression(currentExp);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRuleId) return;
    updateSalaryRule(selectedStructureId, editingRuleId, {
      expression: ruleExpression,
    });
    setEditingRuleId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2E4DE] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            Engine Configuration
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">Salary Rules</h1>
            <span className="text-xs text-[#5F6773]">
              Deterministic sequenced calculation rules executed sequentially for each pay run
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStructureId}
            onChange={(e) => setSelectedStructureId(e.target.value)}
            className="text-xs font-semibold text-[#18191B] border border-[#E2E4DE] bg-white px-3 py-2 rounded focus:outline-none"
          >
            {salaryStructures.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structure Metadata Card */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E4DE] gap-2">
          <div>
            <span className="text-[10px] font-bold text-[#5F6773] uppercase tracking-wider block">
              Active Compensation Template
            </span>
            <div className="text-base font-bold text-[#18191B] mt-0.5">{currentStructure.name}</div>
          </div>
          <span className="font-mono text-xs text-[#1B4332] bg-[#EAF2EC] px-2.5 py-1 rounded border border-[#C2DBC7] font-semibold">
            Code: {currentStructure.code}
          </span>
        </div>
        <p className="text-[#5F6773] mt-3 leading-relaxed">{currentStructure.description}</p>
      </div>

      {/* Execution Pipeline Visual Flow */}
      <div className="bg-[#FBFBF9] border border-[#E2E4DE] rounded-md p-4 text-xs">
        <div className="text-[10px] uppercase font-bold text-[#5F6773] tracking-wider mb-2.5 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-[#1B4332]" />
          <span>Salary Engine Execution Pipeline (Linear Dependency Graph)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-white border border-[#E2E4DE] rounded font-mono font-semibold text-[#18191B]">
            00 Contract CTC
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A92A0]" />
          <span className="px-2.5 py-1 bg-[#EAF2EC] border border-[#C2DBC7] rounded font-mono font-semibold text-[#1B4332]">
            01-04 Earnings (Basic, HRA, Transport, Special)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A92A0]" />
          <span className="px-2.5 py-1 bg-white border border-[#E2E4DE] rounded font-mono font-semibold text-[#18191B]">
            Gross Earnings
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A92A0]" />
          <span className="px-2.5 py-1 bg-[#FEE2E2] border border-[#FECACA] rounded font-mono font-semibold text-[#991B1B]">
            05-08 Statutory Deductions (PF, PT, TDS, LWP)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A92A0]" />
          <span className="px-2.5 py-1 bg-[#1B4332] text-white rounded font-mono font-bold">
            09 Net Disbursal
          </span>
        </div>
      </div>

      {/* Sequenced Rules Table */}
      <div className="bg-white border border-[#E2E4DE] rounded-md overflow-hidden text-xs">
        <div className="p-3.5 bg-[#FBFBF9] border-b border-[#E2E4DE] flex items-center justify-between">
          <span className="font-bold text-xs text-[#18191B]">
            Rule Sequence Execution Order ({currentStructure.rules.length} steps)
          </span>
          <span className="text-[11px] text-[#5F6773]">
            Execution strictly follows sequential numbering (01 to 09)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F4F0] border-b border-[#E2E4DE] text-[10px] font-bold uppercase tracking-wider text-[#5F6773]">
              <tr>
                <th className="px-4 py-3">Seq</th>
                <th className="px-4 py-3">Rule Name & Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Calculation Type</th>
                <th className="px-4 py-3">Formula / Value Expression</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E4DE]">
              {currentStructure.rules.map((rule) => {
                const isNet = rule.category === 'Net';
                const isDeduction = rule.category === 'Deduction';

                return (
                  <tr
                    key={rule.id}
                    className={`hover:bg-[#F9FAF8] transition-colors ${
                      isNet ? 'bg-[#EAF2EC]/30 font-semibold' : ''
                    }`}
                  >
                    {/* Seq */}
                    <td className="px-4 py-3 font-mono font-bold text-xs">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#F4F4F0] border border-[#E2E4DE] text-[#18191B]">
                        {String(rule.sequence).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Rule Name */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#18191B]">{rule.name}</div>
                      <div className="font-mono text-[10px] text-[#5F6773]">{rule.code}</div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rule.category === 'Base'
                            ? 'bg-[#EAF2EC] text-[#1B4332]'
                            : rule.category === 'Allowance'
                            ? 'bg-[#F0F4F1] text-[#2D5A43]'
                            : rule.category === 'Deduction'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#1B4332] text-white'
                        }`}
                      >
                        {rule.category}
                      </span>
                    </td>

                    {/* Calculation Type */}
                    <td className="px-4 py-3 text-[#2D3139]">{rule.calcType}</td>

                    {/* Formula */}
                    <td className="px-4 py-3 font-mono text-[11px] text-[#18191B]">
                      <code className="bg-[#F4F4F0] px-2 py-0.5 rounded border border-[#E2E4DE]">
                        {rule.expression}
                      </code>
                      {rule.description && (
                        <span className="block font-sans text-[10px] text-[#5F6773] mt-0.5">
                          {rule.description}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={rule.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEditRule(rule.id, rule.expression)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#5F6773] hover:text-[#18191B] border border-[#E2E4DE] rounded hover:bg-[#F4F4F0]"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Simulator / Sandbox */}
      <div className="bg-white border border-[#E2E4DE] rounded-md p-6 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E4DE] mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#18191B]">Live Rule Calculation Sandbox</h3>
            <p className="text-[#5F6773]">
              Verify how the sequence computes with varying compensation values
            </p>
          </div>
          <span className="text-xs text-[#1B4332] font-semibold">Deterministic Formula Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-4 space-y-2">
            <label className="block font-semibold text-[#18191B]">Test Annual CTC Benchmark</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={20000}
                value={calculatorCtc}
                onChange={(e) => setCalculatorCtc(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E2E4DE] rounded font-mono text-sm font-bold focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <span className="text-[11px] text-[#5F6773]">
              Monthly Base: <strong className="text-[#18191B] font-mono">{formatINR(monthlyCtc)}/mo</strong>
            </span>
          </div>

          <div className="sm:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[10px] text-[#5F6773] uppercase font-bold block">01 Basic (50%)</span>
              <span className="font-mono font-bold text-sm text-[#18191B] mt-1 block">
                {formatINR(simulatedBasic)}
              </span>
            </div>
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[10px] text-[#5F6773] uppercase font-bold block">02 HRA (25%)</span>
              <span className="font-mono font-bold text-sm text-[#18191B] mt-1 block">
                {formatINR(simulatedHra)}
              </span>
            </div>
            <div className="p-3 bg-[#FBFBF9] border border-[#E2E4DE] rounded">
              <span className="text-[10px] text-[#5F6773] uppercase font-bold block">Statutory PF + PT</span>
              <span className="font-mono font-bold text-sm text-[#B91C1C] mt-1 block">
                {formatINR(simulatedPf + simulatedPt)}
              </span>
            </div>
            <div className="p-3 bg-[#EAF2EC] border border-[#C2DBC7] rounded">
              <span className="text-[10px] text-[#1B4332] uppercase font-bold block">09 Net Pay</span>
              <span className="font-mono font-black text-sm text-[#1B4332] mt-1 block">
                {formatINR(simulatedNet)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Rule Modal */}
      <Modal
        isOpen={!!editingRuleId}
        onClose={() => setEditingRuleId(null)}
        title="Configure Salary Calculation Rule"
        subtitle="Modify the arithmetic formula or percentage expression"
      >
        <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#18191B] mb-1">
              Formula Expression / Static Constant *
            </label>
            <input
              type="text"
              required
              value={ruleExpression}
              onChange={(e) => setRuleExpression(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E4DE] rounded font-mono text-xs focus:outline-none focus:border-[#1B4332]"
            />
            <span className="text-[11px] text-[#5F6773] mt-1 block">
              Supported tokens: Monthly CTC, Basic Salary, Gross Pay, Days in Month, LWP Days.
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E2E4DE]">
            <button
              type="button"
              onClick={() => setEditingRuleId(null)}
              className="px-3 py-1.5 font-medium text-[#5F6773]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-[#1B4332] rounded hover:bg-[#143427]"
            >
              Update Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
