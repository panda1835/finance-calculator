'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/formatters';
import { X } from 'lucide-react';

type Category = {
  key: string;
  label: string;
  value: number;
};

const DEFAULT_CATEGORIES: Category[] = [
  { key: 'housing', label: 'Nhà ở', value: 6000000 },
  { key: 'food', label: 'Ăn uống', value: 4000000 },
  { key: 'health', label: 'Sức khỏe & cơ thể', value: 1500000 },
  { key: 'tools', label: 'Di chuyển & công cụ', value: 1200000 },
  { key: 'margin', label: 'Cuộc sống & dự phòng', value: 3000000 },
];

function formatNumberWithDots(value: number | string) {
  const digits = value.toString().replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function EnoughMoneyCalculator() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [bufferInput, setBufferInput] = useState('25');
  const [multiplierInput, setMultiplierInput] = useState('1.5');
  const [showResults, setShowResults] = useState(false);
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(() =>
    DEFAULT_CATEGORIES.reduce<Record<string, string>>((acc, cat) => {
      acc[cat.key] = formatNumberWithDots(cat.value);
      return acc;
    }, {}),
  );

  const bufferPercent = parseFloat(bufferInput || '0') || 0;
  const multiplier = parseFloat(multiplierInput || '1') || 1;

  const results = useMemo(() => {
    const baseline = categories.reduce((sum, cat) => sum + (isFinite(cat.value) ? cat.value : 0), 0);
    const enough = baseline * (1 + Math.max(0, bufferPercent) / 100);
    const safe = enough * Math.max(1, multiplier);

    return { baseline, enough, safe };
  }, [bufferPercent, categories, multiplier]);

  const handleCategoryChange = (key: string, rawValue: string) => {
    const cleaned = rawValue.replace(/\D/g, '');
    const formatted = formatNumberWithDots(cleaned);
    const numericValue = parseFloat(cleaned) || 0;
    setCategoryInputs((prev) => ({ ...prev, [key]: formatted }));
    setCategories((prev) =>
      prev.map((cat) => (cat.key === key ? { ...cat, value: numericValue } : cat)),
    );
  };

  const handleCalculate = () => {
    setShowResults(true);
    // Kích hoạt lại quá trình tính để người dùng yên tâm sau khi chỉnh sửa.
    setCategories((prev) => [...prev]);
  };

  const bufferNote =
    bufferPercent < 15
      ? 'Đệm an toàn đang hơi thấp cho thu nhập tự do. Cân nhắc 20–30% để chống lại tháng chậm.'
      : bufferPercent > 40
        ? 'Đệm an toàn khá cao. Nếu thấy nặng, 20–30% thường đủ để bạn yên tâm.'
        : 'Đệm an toàn đang ở vùng “dễ thở” cho công việc tự do.';

  const multiplierNote =
    multiplier < 1.35
      ? 'Hệ số an toàn hơi thấp. 1.4–1.7 thường hợp lý cho dòng tiền thất thường.'
      : multiplier > 2
        ? 'Hệ số an toàn khá cao. Nếu thấy áp lực, thử quay về 1.5 như mặc định.'
        : 'Hệ số an toàn đang trong vùng điển hình cho freelancer.';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Nhập liệu</CardTitle>
            <CardDescription>Điền chi phí hằng tháng và các giả định</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <div key={category.key} className="space-y-2">
                  <Label htmlFor={`cat-${category.key}`}>{category.label}</Label>
                  <div className="relative">
                    <Input
                      id={`cat-${category.key}`}
                      type="text"
                      inputMode="numeric"
                      value={categoryInputs[category.key] ?? formatNumberWithDots(category.value)}
                      onChange={(e) => handleCategoryChange(category.key, e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      aria-label={`Xóa ${category.label}`}
                      onClick={() => handleCategoryChange(category.key, '')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="buffer">Phần đệm ổn định (%)</Label>
                <div className="relative">
                  <Input
                    id="buffer"
                    type="text"
                    inputMode="decimal"
                    value={bufferInput}
                    onChange={(e) => setBufferInput(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    aria-label="Xóa phần đệm"
                    onClick={() => setBufferInput('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="multiplier">Hệ số an toàn cho freelance</Label>
                <div className="relative">
                  <Input
                    id="multiplier"
                    type="text"
                    inputMode="decimal"
                    value={multiplierInput}
                    onChange={(e) => setMultiplierInput(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    aria-label="Xóa hệ số an toàn"
                    onClick={() => setMultiplierInput('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" type="button" onClick={handleCalculate}>
              Tính toán
            </Button>
          </CardContent>
        </Card>

        {showResults && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Kết quả</CardTitle>
              <CardDescription>Bức tranh tổng quan theo tháng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <KPI
                  label="Chi phí nền (baseline)"
                  value={formatCurrency(results.baseline)}
                  sub="Tổng chi phí mỗi tháng."
                />
                <KPI
                  label="Mức “Đủ” sau thuế"
                  value={formatCurrency(results.enough)}
                  sub={`Baseline + ${bufferPercent}% đệm.`}
                />
                <KPI
                  label="Mục tiêu an toàn"
                  value={formatCurrency(results.safe)}
                  sub={`Mức “Đủ” × ${multiplier}.`}
                />
              </div>

              <Separator />

              <div className="rounded-lg border">
                <div className="grid grid-cols-[1fr,120px] gap-3 border-b px-4 py-3 text-sm font-semibold text-muted-foreground bg-muted/20">
                  <span>Danh mục</span>
                  <span className="text-right">Số tiền</span>
                </div>
                <div className="divide-y text-left">
                  {categories.map((category) => (
                    <div
                      key={category.key}
                      className="grid grid-cols-[1fr,120px] gap-3 px-4 py-3 text-sm"
                    >
                      <span>{category.label}</span>
                      <span className="text-right">{formatCurrency(category.value)}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr,120px] gap-3 px-4 py-4 text-sm font-bold bg-muted/10">
                    <span>Tổng Baseline hằng tháng</span>
                    <span className="text-right">{formatCurrency(results.baseline)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 shadow-sm">
                <p className="text-primary leading-relaxed">
                  <span className="font-bold mr-2">💡 Đề xuất:</span> Khi bạn duy trì mức{' '}
                  <span className="font-bold underline decoration-primary/30 decoration-2 underline-offset-4">
                  {formatCurrency(results.enough)}
                  </span> ròng mỗi tháng, mọi thu nhập tăng thêm phía trên sẽ chính thức trở thành sự lựa lựa chọn tự do thay vì là gánh nặng mưu sinh.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

type KPIProps = {
  label: string;
  value: string;
  sub?: string;
};

function KPI({ label, value, sub }: KPIProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
