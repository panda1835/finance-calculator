'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

export interface FormData {
  currentIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  currentInvestments?: number;
  targetFINumber: number;
  timeHorizon: number;
  annualReturn: number;
  inflationRate: number;
  monthlySavings?: number;
  monthlyInvestment?: number;
  savingsInterestRate?: number;
}

interface FinanceInputFormProps {
  data: FormData;
  onChange: (data: FormData) => void;
  mode: 'goal-based' | 'time-based';
}

interface InputFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: 'currency' | 'percentage' | 'number';
  tooltip?: string;
  required?: boolean;
}

function InputField({ id, label, value, onChange, type = 'number', tooltip, required = true }: InputFieldProps) {
  const formatWithCommas = (num: string) => {
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  };

  const [displayValue, setDisplayValue] = useState(() => {
    if (type === 'percentage') {
      return (value * 100).toFixed(1);
    }
    return formatWithCommas(value.toString());
  });

  // Sync display value when prop value changes
  useEffect(() => {
    if (document.activeElement !== document.getElementById(id)) {
      if (type === 'percentage') {
        setDisplayValue((value * 100).toFixed(1));
      } else {
        setDisplayValue(formatWithCommas(value.toString()));
      }
    }
  }, [value, type, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9,]/g, '').replace(/,/g, '.');
    const numericValue = rawValue.replace(/\./g, '');
    
    if (type === 'percentage') {
      setDisplayValue(rawValue);
      const numValue = parseFloat(rawValue.replace(/\./g, '').replace(/,/g, '.')) || 0;
      onChange(numValue / 100);
    } else {
      setDisplayValue(formatWithCommas(numericValue));
      const numValue = parseFloat(numericValue) || 0;
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const cleanValue = displayValue.replace(/\./g, '').replace(/,/g, '.');
    const numValue = parseFloat(cleanValue) || 0;
    
    if (type === 'percentage') {
      setDisplayValue(numValue.toFixed(1));
    } else if (type === 'currency' || type === 'number') {
      setDisplayValue(formatWithCommas(Math.round(numValue).toString()));
    }
  };

  const prefix = type === 'currency' ? '' : '';
  const suffix = type === 'percentage' ? '%' : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''}`}
          required={required}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function FinanceInputForm({ data, onChange, mode }: FinanceInputFormProps) {
  const updateField = (field: keyof FormData) => (value: number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Cá Nhân</CardTitle>
          <CardDescription>
            {mode === 'goal-based' 
              ? 'Tình hình tài chính hiện tại của bạn'
              : 'Thu nhập và thời gian mục tiêu của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Income field removed from all modes as requested */}
          {mode === 'time-based' && (
            <InputField
              id="monthlyExpenses"
              label="Chi Phí Hàng Tháng"
              value={data.monthlyExpenses}
              onChange={updateField('monthlyExpenses')}
              type="currency"
              tooltip="Chi tiêu trung bình hàng tháng bao gồm các hóa đơn, thực phẩm và chi tiêu cá nhân"
            />
          )}
          
          <InputField
            id="currentSavings"
            label="Tiền Tiết Kiệm Hiện Tại (Ngân Hàng)"
            value={data.currentSavings}
            onChange={updateField('currentSavings')}
            type="currency"
            tooltip="Số tiền mặt và tiết kiệm ngân hàng hiện có (hưởng lãi suất tiết kiệm)"
          />
          <InputField
            id="currentInvestments"
            label="Tiền Đầu Tư Hiện Tại (Cổ Phiếu/Bonds)"
            value={data.currentInvestments || 0}
            onChange={updateField('currentInvestments')}
            type="currency"
            tooltip="Số tiền đang đầu tư vào cổ phiếu, chứng khoán, v.v. (hưởng lợi nhuận đầu tư)"
            required={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'goal-based' ? 'Mục Tiêu Tài Chính' : 'Chiến Lược Tài Chính'}
          </CardTitle>
          <CardDescription>
            {mode === 'goal-based'
              ? 'Mục tiêu tự do tài chính của bạn'
              : 'Thời gian và chiến lược của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'goal-based' ? (
            <>
              <InputField
                id="targetFINumber"
                label="Số Tiền Tự Do Tài Chính Mong Muốn (đã bao gồm lạm phát)"
                value={data.targetFINumber}
                onChange={updateField('targetFINumber')}
                type="currency"
                tooltip="Tổng tài sản cần thiết để đạt tự do tài chính (theo giá trị tương lai)."
              />
              <InputField
                id="timeHorizon"
                label="Thời Gian Dự Kiến (năm)"
                value={data.timeHorizon}
                onChange={updateField('timeHorizon')}
                type="number"
                tooltip="Số năm bạn muốn để đạt được tự do tài chính"
              />
            </>
          ) : (
            <InputField
              id="timeHorizon"
              label="Thời Gian Dự Kiến (năm)"
              value={data.timeHorizon}
              onChange={updateField('timeHorizon')}
              type="number"
              tooltip="Số năm bạn có để đạt tự do tài chính"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Giả Định</CardTitle>
          <CardDescription>Lợi nhuận và lạm phát dự kiến</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="annualReturn"
            label="Lợi Nhuận Đầu Tư Hàng Năm"
            value={data.annualReturn}
            onChange={updateField('annualReturn')}
            type="percentage"
            tooltip="Lợi nhuận trung bình hàng năm dự kiến từ đầu tư. Trung bình thị trường chứng khoán lịch sử khoảng 7-10%."
          />
          <InputField
            id="savingsInterestRate"
            label="Lãi Suất Tiết Kiệm Hàng Năm"
            value={data.savingsInterestRate || 0}
            onChange={updateField('savingsInterestRate')}
            type="percentage"
            tooltip="Lãi suất tiết kiệm ngân hàng hàng năm. Thường khoảng 2-3%."
            required={false}
          />
          <InputField
            id="inflationRate"
            label="Tỷ Lệ Lạm Phát Hàng Năm"
            value={data.inflationRate}
            onChange={updateField('inflationRate')}
            type="percentage"
            tooltip="Tỷ lệ lạm phát trung bình hàng năm dự kiến. Trung bình lịch sử khoảng 2-3%."
          />
        </CardContent>
      </Card>
    </div>
  );
}
