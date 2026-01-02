'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { CalculationResults } from '@/lib/calculations';
import { TrendingUp, Target, Clock, Wallet } from 'lucide-react';

interface ResultsDisplayProps {
  results: CalculationResults;
  mode: 'goal-based' | 'time-based' | 'contribution-based';
}

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
  highlight?: boolean;
}

function ResultCard({ icon, label, value, description, highlight = false }: ResultCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-accent border-primary' : 'bg-card'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${highlight ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-primary' : ''}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResultsDisplay({ results, mode }: ResultsDisplayProps) {
  const {
    requiredMonthlySavings,
    inflationAdjustedFINumber,
    yearsToFI,
    monthsToFI,
    totalMonthsToFI,
    calculatedFINumber,
    suggestedMonthlySavings,
    suggestedMonthlyInvestment,
    totalFutureSavings,
    totalFutureInvestment,
    targetAtCompletion,
  } = results;

  const isAlreadyFI = totalMonthsToFI === 0;
  const timelineText = isAlreadyFI 
    ? 'Đã đạt được!' 
    : formatDuration(yearsToFI, monthsToFI);
  const yearsLabelText = Number.isFinite(yearsToFI) ? `${yearsToFI}` : 'N/A';

  const headingCopy =
    mode === 'goal-based'
      ? 'Kế Hoạch Tự Do Tài Chính Của Bạn'
      : mode === 'time-based'
        ? 'Chiến Lược Tài Chính Được Đề Xuất'
        : 'Lộ Trình Dựa Trên Đóng Góp Hàng Tháng';

  const subheadingCopy =
    mode === 'goal-based'
      ? 'Dựa trên thông tin của bạn, đây là những gì bạn cần để đạt được tự do tài chính'
      : mode === 'time-based'
        ? 'Dựa trên thu nhập và thời gian của bạn, đây là chiến lược được đề xuất'
        : 'Dựa trên số tiền bạn đóng góp mỗi tháng, đây là thời gian và mục tiêu bạn sẽ đạt';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{headingCopy}</CardTitle>
        <CardDescription>{subheadingCopy}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === 'time-based' && calculatedFINumber && (
          <ResultCard
            icon={<Target className="h-5 w-5" />}
            label="Mục Tiêu Tự Do Tài Chính (Đã bao gồm lạm phát)"
            value={formatCurrency(calculatedFINumber)}
            description="Số tiền bạn cần đạt được trong tương lai để duy trì mức sống hiện tại"
            highlight={true}
          />
        )}

        {mode === 'contribution-based' && (
          <ResultCard
            icon={<Target className="h-5 w-5" />}
            label="Mục Tiêu Tự Do Tài Chính (điều chỉnh theo lạm phát)"
            value={formatCurrency(targetAtCompletion || inflationAdjustedFINumber)}
            description="Mục tiêu di động tăng dần theo lạm phát cho tới khi đạt được"
            highlight={true}
          />
        )}

        {mode === 'goal-based' && (
          <ResultCard
            icon={<Wallet className="h-5 w-5" />}
            label="Tổng Số Tiền Cần Hàng Tháng"
            value={formatCurrency(requiredMonthlySavings)}
            description="Tổng số tiền bạn cần tiết kiệm và đầu tư mỗi tháng"
            highlight={true}
          />
        )}

        {mode === 'contribution-based' && (
          <ResultCard
            icon={<Wallet className="h-5 w-5" />}
            label="Đóng Góp Hàng Tháng Hiện Tại"
            value={formatCurrency(requiredMonthlySavings)}
            description="Tổng số tiền tiết kiệm + đầu tư bạn đang lên kế hoạch mỗi tháng"
            highlight={true}
          />
        )}

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <ResultCard
            icon={<Wallet className="h-5 w-5" />}
            label="Tiết Kiệm Hàng Tháng Đề Xuất"
            value={formatCurrency(suggestedMonthlySavings || 0)}
            description="30% tổng số tiền (lãi suất thấp)"
          />
          <ResultCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Đầu Tư Hàng Tháng Đề Xuất"
            value={formatCurrency(suggestedMonthlyInvestment || 0)}
            description="70% tổng số tiền (lợi nhuận cao hơn)"
          />
        </div>

        {(mode === 'goal-based' || mode === 'contribution-based') && (
          <ResultCard
            icon={<Clock className="h-5 w-5" />}
            label="Thời Gian Đạt Tự Do Tài Chính"
            value={timelineText}
            description="Thời gian cần thiết để đạt số tiền tự do tài chính"
          />
        )}

        <Separator />
        
        <div className="grid gap-4 md:grid-cols-2">
          <ResultCard
            icon={<Wallet className="h-5 w-5" />}
            label={`Tổng Tiền Tiết Kiệm Sau ${yearsLabelText} Năm`}
            value={formatCurrency(totalFutureSavings || 0)}
            description="Tổng giá trị tiền tiết kiệm trong tương lai"
          />
          <ResultCard
            icon={<TrendingUp className="h-5 w-5" />}
            label={`Tổng Tiền Đầu Tư Sau ${yearsLabelText} Năm`}
            value={formatCurrency(totalFutureInvestment || 0)}
            description="Tổng giá trị đầu tư trong tương lai"
          />
        </div>

        {isAlreadyFI && (mode === 'goal-based' || mode === 'contribution-based') && (
          <div className="p-4 bg-accent rounded-lg border border-primary">
            <p className="text-sm font-medium text-center">
              🎉 Chúc mừng! Bạn đã đạt được tự do tài chính!
            </p>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Chiến lược:</strong> Phân bổ 70% vào đầu tư và 30% vào tiết kiệm để cân bằng giữa tăng trưởng và bảo vệ vốn.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
