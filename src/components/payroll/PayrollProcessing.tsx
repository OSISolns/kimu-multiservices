'use client';

import React, { useState, useEffect } from 'react';
import { Employee, Payroll } from '@/types/payroll';

interface PayrollProcessingProps {
  user: any;
}

export default function PayrollProcessing({ user }: PayrollProcessingProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [workingDays, setWorkingDays] = useState(22);
  const [notes, setNotes] = useState('');
  const [processedPayrolls, setProcessedPayrolls] = useState<Payroll[]>([]);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payroll/employees?status=active');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const processPayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    try {
      setIsProcessing(true);
      const [year, month] = selectedPeriod.split('-').map(Number);
      
      const response = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.username,
        },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          period: selectedPeriod,
          year,
          month,
          workingDays,
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProcessedPayrolls(data.data.processedPayrolls);
        setErrors(data.data.errors);
        setSelectedEmployees([]);
        setNotes('');
        
        if (data.data.errors.length > 0) {
          alert(`Payroll processed with ${data.data.errors.length} errors. Check the results below.`);
        } else {
          alert('Payroll processed successfully!');
        }
      } else {
        alert(data.error || 'Failed to process payroll');
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Failed to process payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Process Payroll</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payroll Period
            </label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Days
            </label>
            <input
              type="number"
              value={workingDays}
              onChange={(e) => setWorkingDays(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="31"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes for this payroll run..."
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Select Employees</h3>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedEmployees.includes(employee.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleEmployeeSelect(employee.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => handleEmployeeSelect(employee.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.user.fullName || employee.user.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.position} • {employee.department} • {formatCurrency(employee.salary)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedEmployees.length} employee(s) selected
          </div>
          <button
            onClick={processPayroll}
            disabled={isProcessing || selectedEmployees.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process Payroll'}
          </button>
        </div>
      </div>

      {/* Results */}
      {(processedPayrolls.length > 0 || errors.length > 0) && (
        <div className="space-y-6">
          {processedPayrolls.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Successfully Processed ({processedPayrolls.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedPayrolls.map((payroll) => (
                      <tr key={payroll.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employee.user.fullName || payroll.employee.user.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.grossSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payroll.netSalary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Processed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-900 mb-4">
                Errors ({errors.length})
              </h3>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm font-medium text-red-800">
                      {error.employeeName}
                    </div>
                    <div className="text-sm text-red-600">
                      {error.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

