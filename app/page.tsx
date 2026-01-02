"use client";

import { useMemo, useState } from "react";
import {
  FinanceInputForm,
  FormData,
} from "@/components/calculator/FinanceInputForm";
import { ResultsDisplay } from "@/components/calculator/ResultsDisplay";
import { TimelineChart } from "@/components/calculator/TimelineChart";
import { EnoughMoneyCalculator } from "@/components/calculator/EnoughMoneyCalculator";
import {
  calculateFinancialIndependence,
  CalculationResults,
} from "@/lib/calculations";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

export type CalculatorMode = "goal-based" | "time-based" | "contribution-based";
type ViewId = "goal" | "timeline" | "contribution" | "enough" | "about";

const NAV_ITEMS: Array<{
  id: ViewId;
  label: string;
  description: string;
  formula: string;
  icon: any;
  mode?: CalculatorMode;
}> = [
  {
    id: "goal",
    label: "Kế Hoạch Theo Mục Tiêu",
    description: "Đề xuất kế hoạch tài chính khi có mục tiêu tài chính cụ thể và thời gian mong muốn",
    formula: "Sử dụng công thức Giá trị tương lai: FV = Mục tiêu × (1 + lạm phát)ⁿ để tìm con số thực tế cần đạt. Sau đó áp dụng công thức Giá trị tương lai của dòng tiền để tính số tiền đóng góp hàng tháng dựa trên lãi kép và thời gian tích lũy.",
    icon: Target,
    mode: "goal-based",
  },
  {
    id: "timeline",
    label: "Kế Hoạch Theo Thời Gian",
    description: "Đề xuất kế hoạch tự do tài chính khi biết chi tiêu hàng tháng và thời gian mong muốn",
    formula: "Xác định mục tiêu tự do tài chính = Chi phí năm × 25 (theo Quy tắc 4% rút tiền an toàn). Hệ thống tính toán dòng tiền cần thiết để bù đắp khoảng cách từ tài sản hiện tại đến mục tiêu tự do tài chính trượt giá, sử dụng sức mạnh của lãi kép cộng dồn hàng tháng.",
    icon: Calendar,
    mode: "time-based",
  },
  {
    id: "contribution",
    label: "Lộ Trình Theo Đóng Góp",
    description:
      "Tính số năm đạt mục tiêu tài chính khi biết mức đóng góp hàng tháng",
    formula: "Giải phương trình tích lũy: Tài sản cuối = (Vốn hiện tại) × (1+r)ⁿ + (Góp tháng) × [((1+r)ⁿ - 1) / r]. Công thức này tìm ra số năm (n) để tổng tài sản tích lũy (bao gồm lãi nhập vốn) vượt qua mục tiêu tài chính đã được điều chỉnh lạm phát.",
    icon: TrendingUp,
    mode: "contribution-based",
  },
  {
    id: "enough",
    label: "Tính Mức “Đủ”",
    description:
      "Tính mức chi phí “đủ” và mục tiêu an toàn khi thu nhập dao động",
    formula: "Mức 'Đủ' = Chi phí thiết yếu + Dự phòng cơ bản. Mục tiêu an toàn = Mức 'Đủ' × Hàng số đệm (thường là 1.2 - 1.5). Đây là mô hình quản trị rủi ro giúp bạn xác định mức thu nhập ròng tối thiểu cần thiết để không rơi vào nợ nần khi gặp biến động.",
    icon: Wallet,
  },
  {
    id: "about",
    label: "Giới Thiệu & Hướng Dẫn",
    description: "Giải thích công cụ và giả định tính toán",
    formula: "Hướng dẫn sử dụng các chỉ số tài chính và các giả định kinh tế trong mô hình tính toán.",
    icon: Info,
  },
];

const DEFAULT_DATA: FormData = {
  currentIncome: 300000000,
  monthlyExpenses: 10000000,
  currentSavings: 500000000,
  currentInvestments: 0,
  targetFINumber: 10000000000,
  timeHorizon: 15,
  annualReturn: 0.07,
  inflationRate: 0.03,
  monthlySavings: 0,
  monthlyInvestment: 0,
  savingsInterestRate: 0.05,
};

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("goal");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(DEFAULT_DATA);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const activeNav = NAV_ITEMS.find((item) => item.id === activeView);

  const handleCalculate = () => {
    const calculatorMode = activeNav?.mode;
    if (!calculatorMode) return;

    try {
      const calculatedResults = calculateFinancialIndependence(
        { ...formData },
        calculatorMode
      );
      setResults(calculatedResults);
    } catch (error) {
      console.error("Calculation error:", error);
    }
  };

  const calculatorMode = activeNav?.mode;
  const isAboutView = activeView === "about";
  const isEnoughView = activeView === "enough";

  const renderNavItems = (collapsed: boolean, closeMobile?: boolean) => (
    <div className={`space-y-1 ${collapsed ? "p-2" : "p-3"}`}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full transition-all duration-200 ${
              collapsed ? "justify-center px-0 h-12" : "justify-start px-4 py-4 h-auto"
            }`}
            onClick={() => {
              setActiveView(item.id);
              if (closeMobile) setIsMobileNavOpen(false);
            }}
          >
            <Icon className={`flex-shrink-0 ${collapsed ? "h-6 w-6" : "mr-3 h-5 w-5"}`} />
            {!collapsed && (
              <div className="flex flex-col items-start min-w-0 text-left whitespace-normal">
                <span className="font-semibold text-sm leading-tight">{item.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-1">
                  {item.description}
                </span>
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen border-r bg-card transition-all duration-300 z-30 ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="p-4 border-b flex items-center min-h-[65px]">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <Image src="/logo.png" alt="Máy Tính Tài Chính Cá Nhân Logo" width={32} height={32} className="flex-shrink-0" />
              <span className="font-bold text-sm tracking-tight truncate">Máy Tính Tài Chính Cá Nhân</span>
            </div>
          ) : (
            <div className="mx-auto">
              <Image src="/logo.png" alt="Logo" width={32} height={32} />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderNavItems(isSidebarCollapsed)}
        </div>
        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            size="icon"
            className={`w-full ${isSidebarCollapsed ? "justify-center" : "justify-start px-3"}`}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <div className="flex items-center gap-3">
                <PanelLeftClose className="h-5 w-5" />
                <span className="text-sm font-medium">Thu gọn</span>
              </div>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile & Page Title for Content */}
        <header className="border-b bg-card sticky top-0 z-40 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <Image src="/logo.png" alt="Máy Tính Tài Chính Cá Nhân Logo" width={32} height={32} />
              <h1 className="text-lg font-bold">Máy Tính Tài Chính Cá Nhân</h1>
            </div>
            
            {/* <div className="hidden lg:block">
              <h2 className="text-xl font-bold">{activeNav?.label}</h2>
            </div> */}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Mobile Dropdown */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileNavOpen ? 'max-h-screen py-4 border-t mt-4' : 'max-h-0'}`}>
            {renderNavItems(false, true)}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 lg:p-8">
          <section className="max-w-7xl mx-auto space-y-8">
            <div className={`mb-8 ${isAboutView ? "lg:mb-0" : ""}`}>
              <h2 className="text-3xl font-bold tracking-tight mb-2">{activeNav?.label}</h2>
              {!isAboutView && (
                <>
                  <p className="text-muted-foreground text-lg mb-4">{activeNav?.description}</p>
                  <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                    <p className="text-sm text-primary leading-relaxed">
                      <span className="font-bold uppercase tracking-wider text-[10px] mr-2 opactiy-70">Cách tính:</span>
                      {activeNav?.formula}
                    </p>
                  </div>
                </>
              )}
            </div>

            {isAboutView ? (
              <div className="max-w-3xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Về Công Cụ Này</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Công cụ này được thiết kế để giúp bạn hình dung và lập kế hoạch cho hành trình tự do tài chính của mình, được tùy chỉnh cho bối cảnh Việt Nam.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { title: "Quy Tắc 4%", desc: "Dựa trên quy tắc 25 lần, cho thấy bạn cần tích lũy 25 lần chi phí hàng năm." },
                    { title: "Lạm Phát", desc: "Tất cả các tính toán đều tính đến lạm phát để đảm bảo sức mua tương lai." },
                    { title: "Lãi Kép", desc: "Sử dụng sức mạnh của lãi kép để dự đoán sự tăng trưởng đầu tư." },
                    { title: "Tùy Chỉnh", desc: "Linh hoạt điều chỉnh các giả định để phù hợp với rủi ro của bạn." },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2 p-4 border rounded-lg bg-card text-card-foreground">
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : isEnoughView ? (
              <EnoughMoneyCalculator />
            ) : (
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-8">
                  {calculatorMode && (
                    <FinanceInputForm data={formData} onChange={setFormData} mode={calculatorMode} />
                  )}
                  <Button className="w-full" size="lg" onClick={handleCalculate}>
                    Tính Toán
                  </Button>
                </div>
                
                {results && calculatorMode && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResultsDisplay results={results} mode={calculatorMode} />
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                      <h3 className="font-semibold mb-6 text-xl">Biểu đồ tiến độ dự kiến</h3>
                      <TimelineChart inputs={formData} mode={calculatorMode} results={results} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
