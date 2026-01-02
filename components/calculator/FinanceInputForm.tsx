'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, X } from 'lucide-react';

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
  mode: 'goal-based' | 'time-based' | 'contribution-based';
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const hasValue = displayValue.length > 0;

  const handleClear = () => {
    setDisplayValue('');
    onChange(0);
  };

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
          className={`${prefix ? 'pl-7' : ''} ${suffix ? 'pr-16' : 'pr-12'}`}
          required={required}
        />
        {suffix && (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Xóa ${label}`}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition ${
            hasValue ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
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
              : 'Chi phí và nền tảng tài chính hiện tại của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(mode === 'time-based' || mode === 'contribution-based') && (
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
            label="Tiền Tiết Kiệm (Ngân Hàng)"
            value={data.currentSavings}
            onChange={updateField('currentSavings')}
            type="currency"
            tooltip="Số tiền mặt và tiết kiệm ngân hàng hiện có"
          />
          <InputField
            id="currentInvestments"
            label="Tiền Đầu Tư (Cổ Phiếu/Bonds)"
            value={data.currentInvestments || 0}
            onChange={updateField('currentInvestments')}
            type="currency"
            tooltip="Số tiền đang đầu tư vào cổ phiếu, chứng khoán, v.v."
            required={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'goal-based' ? 'Mục Tiêu Tài Chính' : mode === 'time-based' ? 'Chiến Lược Tài Chính' : 'Mục Tiêu & Chiến Lược'}
          </CardTitle>
          <CardDescription>
            {mode === 'goal-based'
              ? 'Mục tiêu tự do tài chính của bạn'
              : mode === 'time-based'
                ? 'Thời gian và chiến lược của bạn'
                : 'Mục tiêu tài chính bạn muốn đạt và quỹ thời gian tham khảo'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'goal-based' ? (
            <>
              <InputField
                id="targetFINumber"
                label="Số Tiền Mong Muốn (Đã tính lạm phát)"
                value={data.targetFINumber}
                onChange={updateField('targetFINumber')}
                type="currency"
                tooltip="Tổng tài sản cần thiết để đạt tự do tài chính."
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
          ) : mode === 'contribution-based' ? (
            <>
              <InputField
                id="targetFINumber"
                label="Mục Tiêu Tự Do Tài Chính"
                value={data.targetFINumber}
                onChange={updateField('targetFINumber')}
                type="currency"
              />
              <InputField
                id="timeHorizon"
                label="Số Năm Muốn Theo Dõi"
                value={data.timeHorizon}
                onChange={updateField('timeHorizon')}
                type="number"
                required={false}
              />
            </>
          ) : (
            <InputField
              id="timeHorizon"
              label="Thời Gian Dự Kiến (năm)"
              value={data.timeHorizon}
              onChange={updateField('timeHorizon')}
              type="number"
            />
          )}
        </CardContent>
      </Card>

      {mode === 'contribution-based' && (
        <Card>
          <CardHeader>
            <CardTitle>Đóng Góp Hàng Tháng</CardTitle>
            <CardDescription>Số tiền tích lũy định kỳ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField
              id="monthlySavings"
              label="Tiết Kiệm/Tháng"
              value={data.monthlySavings || 0}
              onChange={updateField('monthlySavings')}
              type="currency"
            />
            <InputField
              id="monthlyInvestment"
              label="Đầu Tư/Tháng"
              value={data.monthlyInvestment || 0}
              onChange={updateField('monthlyInvestment')}
              type="currency"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Giả Định</CardTitle>
          <CardDescription>Thị trường và nền kinh tế</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="annualReturn"
            label="Lợi Nhuận Đầu Tư"
            value={data.annualReturn}
            onChange={updateField('annualReturn')}
            type="percentage"
          />
          <InputField
            id="savingsInterestRate"
            label="Lãi Suất Tiết Kiệm"
            value={data.savingsInterestRate || 0}
            onChange={updateField('savingsInterestRate')}
            type="percentage"
            required={false}
          />
          <InputField
            id="inflationRate"
            label="Tỷ Lệ Lạm Phát"
            value={data.inflationRate}
            onChange={updateField('inflationRate')}
            type="percentage"
          />
        </CardContent>
      </Card>
    </div>
  );
}
