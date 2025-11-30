'use client';

import { useState, useEffect } from 'react';
import { FinanceInputForm, FormData } from '@/components/calculator/FinanceInputForm';
import { ResultsDisplay } from '@/components/calculator/ResultsDisplay';
import { TimelineChart } from '@/components/calculator/TimelineChart';
import { calculateFinancialIndependence, CalculationResults } from '@/lib/calculations';
import Image from 'next/image'; 
import { Button } from '@/components/ui/button';

export type CalculatorMode = 'goal-based' | 'time-based';

const DEFAULT_DATA: FormData = {
  currentIncome: 300000000, // 300 million VND (~$12,000 USD)
  monthlyExpenses: 10000000, // 15 million VND (~$600 USD)
  currentSavings: 500000000, // 500 million VND (~$20,000 USD)
  currentInvestments: 0,
  targetFINumber: 10000000000, // 10 billion VND (~$400,000 USD)
  timeHorizon: 15,
  annualReturn: 0.07,
  inflationRate: 0.03,
  monthlySavings: 0,
  monthlyInvestment: 0,
  savingsInterestRate: 0.05, // 2% for savings account
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('goal-based');
  const [formData, setFormData] = useState<FormData>(DEFAULT_DATA);
  const [results, setResults] = useState<CalculationResults | null>(null);

  const handleCalculate = () => {
    try {
      const calculatedResults = calculateFinancialIndependence({
        currentIncome: formData.currentIncome,
        monthlyExpenses: formData.monthlyExpenses,
        currentSavings: formData.currentSavings,
        currentInvestments: formData.currentInvestments,
        targetFINumber: formData.targetFINumber,
        timeHorizon: formData.timeHorizon,
        annualReturn: formData.annualReturn,
        inflationRate: formData.inflationRate,
        monthlySavings: formData.monthlySavings,
        monthlyInvestment: formData.monthlyInvestment,
        savingsInterestRate: formData.savingsInterestRate,
      }, calculatorMode);
      setResults(calculatedResults);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className=" rounded-lg">
                <Image src="/logo.png" alt="Calculator" width={40} height={40} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Máy Tính Tự Do Tài Chính
                </h1>
              </div>
            </div>
            
            {/* Nav Tabs */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'calculator' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('calculator')}
                size="sm"
              >
                Máy Tính
              </Button>
              <Button
                variant={activeTab === 'about' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('about')}
                size="sm"
              >
                Giới Thiệu
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'calculator' ? (
          <div className="space-y-8">
            {/* Mode Selector - Moved to Main Section */}
            <div className="flex justify-center">
              <div className="bg-muted p-1 rounded-lg inline-flex">
                <Button
                  variant={calculatorMode === 'goal-based' ? 'default' : 'ghost'}
                  onClick={() => setCalculatorMode('goal-based')}
                  size="sm"
                  className="w-40"
                >
                  Theo Mục Tiêu
                </Button>
                <Button
                  variant={calculatorMode === 'time-based' ? 'default' : 'ghost'}
                  onClick={() => setCalculatorMode('time-based')}
                  size="sm"
                  className="w-40"
                >
                  Theo Thời Gian
                </Button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Input Form */}
              <div className="space-y-6">
                <FinanceInputForm 
                  data={formData} 
                  onChange={setFormData}
                  mode={calculatorMode}
                />
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleCalculate}
                >
                  Tính Toán
                </Button>
              </div>

              {/* Right Column - Results and Chart */}
              <div className="space-y-6">
                {results && (
                  <>
                    <ResultsDisplay results={results} mode={calculatorMode} />
                    <TimelineChart 
                      inputs={formData} 
                      mode={calculatorMode}
                      results={results}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* About Section Content */
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Về Công Cụ Này</h2>
              <p className="text-muted-foreground text-lg">
                Công cụ này được thiết kế để giúp bạn hình dung và lập kế hoạch cho hành trình tự do tài chính của mình, 
                được tùy chỉnh cho bối cảnh Việt Nam.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Quy Tắc 4%</h3>
                <p className="text-muted-foreground">
                  Dựa trên Quy tắc 4% (hay quy tắc 25 lần), cho thấy bạn cần tích lũy 25 lần chi phí hàng năm 
                  để có thể rút 4% mỗi năm mà không bao giờ hết tiền.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Lạm Phát</h3>
                <p className="text-muted-foreground">
                  Tất cả các tính toán đều tính đến lạm phát để đảm bảo sức mua trong tương lai của bạn 
                  được phản ánh chính xác.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Lãi Kép</h3>
                <p className="text-muted-foreground">
                  Sử dụng sức mạnh của lãi kép để dự đoán sự tăng trưởng của các khoản đầu tư 
                  và tiết kiệm của bạn theo thời gian.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Tùy Chỉnh</h3>
                <p className="text-muted-foreground">
                  Linh hoạt điều chỉnh các giả định về lợi nhuận đầu tư và lạm phát để phù hợp 
                  với mức độ chấp nhận rủi ro của bạn.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
