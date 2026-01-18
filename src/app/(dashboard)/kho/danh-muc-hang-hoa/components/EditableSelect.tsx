'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ProductOption } from '../utils/constants';

interface EditableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ProductOption[];
  onAddNew?: (newValue: string) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  value,
  onValueChange,
  options,
  onAddNew,
  placeholder,
  label,
  disabled = false,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = useCallback((selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setInputValue('');
  }, [onValueChange]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      
      if (trimmedValue) {
        // Tìm kiếm chính xác hoặc không phân biệt hoa thường
        const exactMatch = options.find(opt => 
          opt.value.toLowerCase() === trimmedValue.toLowerCase() ||
          opt.label.toLowerCase() === trimmedValue.toLowerCase()
        );
        
        if (exactMatch) {
          // Nếu tìm thấy, chọn nó
          handleSelect(exactMatch.value);
        } else if (onAddNew) {
          // Nếu không tìm thấy và cho phép thêm mới, thêm ngay
          onAddNew(trimmedValue);
          onValueChange(trimmedValue);
          setOpen(false);
          setInputValue('');
        }
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setInputValue('');
    }
  }, [inputValue, options, onAddNew, onValueChange, handleSelect]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {value ? options.find(option => option.value === value)?.label : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-3">
                  {onAddNew && inputValue.trim() ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Không tìm thấy "{inputValue}"
                      </div>
                      <div className="text-xs text-gray-500">
                        Nhấn <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> để thêm mới
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-2">
                      Nhập để tìm kiếm hoặc thêm mới
                    </div>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <CheckCircle2
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100 text-blue-600" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
