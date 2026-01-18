'use client';

import { Badge } from '@/components/ui/badge';
import { Check, Package, FileText, List } from 'lucide-react';

interface MobileStepIndicatorProps {
  currentStep: 'form' | 'products' | 'details';
  selectedMaterialsCount: number;
  onStepClick: (step: 'form' | 'products' | 'details') => void;
}

export default function MobileStepIndicator({
  currentStep,
  selectedMaterialsCount,
  onStepClick
}: MobileStepIndicatorProps) {
  const steps = [
    {
      id: 'form' as const,
      label: 'Thông tin',
      icon: FileText,
      completed: currentStep !== 'form'
    },
    {
      id: 'products' as const,
      label: 'Sản phẩm',
      icon: Package,
      completed: currentStep === 'details'
    },
    {
      id: 'details' as const,
      label: 'Chi tiết',
      icon: List,
      completed: false,
      disabled: selectedMaterialsCount === 0
    }
  ];

  return (
    <div className="flex items-center justify-between bg-white border-b px-2 py-2">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = step.completed;
          const isDisabled = step.disabled;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => !isDisabled && onStepClick(step.id)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span>{step.label}</span>
                {step.id === 'details' && selectedMaterialsCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {selectedMaterialsCount}
                  </Badge>
                )}
              </button>
              
              {index < steps.length - 1 && (
                <div className={`w-2 h-0.5 mx-1 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
