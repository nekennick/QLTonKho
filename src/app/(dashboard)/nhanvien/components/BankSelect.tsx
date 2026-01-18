// components/BankSelect.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Building, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { EmployeeUtils } from '../utils/employeeUtils';

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

interface BankSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export const BankSelect = React.memo<BankSelectProps>(({
  value,
  onValueChange,
  label,
  placeholder = "Chọn ngân hàng"
}) => {
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Load banks on component mount
  useEffect(() => {
    const loadBanks = async () => {
      setLoading(true);
      try {
        const bankList = await EmployeeUtils.fetchBanks();
        setBanks(bankList);
      } catch (error) {
        console.error('Error loading banks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBanks();
  }, []);

  // Filter banks based on search
  const filteredBanks = useMemo(() => {
    if (!searchValue.trim()) return banks;
    
    const search = searchValue.toLowerCase();
    return banks.filter(bank => 
      bank.shortName.toLowerCase().includes(search) ||
      bank.name.toLowerCase().includes(search) ||
      bank.bin.includes(search) ||
      bank.code.toLowerCase().includes(search)
    );
  }, [banks, searchValue]);

  const handleSelect = useCallback((bank: Bank) => {
    const formattedValue = EmployeeUtils.formatBankName(bank);
    onValueChange(formattedValue);
    setOpen(false);
    setSearchValue('');
  }, [onValueChange]);

  const selectedBank = useMemo(() => {
    if (!value) return null;
    // Extract bin from value format: (bin) shortName
    const binMatch = value.match(/\((\d+)\)/);
    if (binMatch) {
      return banks.find(bank => bank.bin === binMatch[1]);
    }
    return null;
  }, [value, banks]);

  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm font-medium text-gray-700">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              {selectedBank ? (
                <div className="flex items-center space-x-2 min-w-0">
                  {selectedBank.logo && (
                    <img 
                      src={selectedBank.logo} 
                      alt={selectedBank.shortName}
                      className="w-4 h-4 object-contain flex-shrink-0"
                    />
                  )}
                  <span className="truncate">
                    ({selectedBank.bin}) {selectedBank.shortName}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500 truncate">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm kiếm ngân hàng..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="text-xs sm:text-sm"
            />
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-sm">Đang tải...</span>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-gray-500">
                  Không tìm thấy ngân hàng
                </div>
              )}
            </CommandEmpty>
            <CommandList>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredBanks.map((bank) => {
                  const isSelected = selectedBank?.id === bank.id;
                  
                  return (
                    <CommandItem
                      key={bank.id}
                      value={bank.bin}
                      onSelect={() => handleSelect(bank)}
                      className="text-xs sm:text-sm py-2"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isSelected ? "opacity-100 text-primary" : "opacity-0"
                          )}
                        />
                        {bank.logo && (
                          <img 
                            src={bank.logo} 
                            alt={bank.shortName}
                            className="w-6 h-6 object-contain flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            ({bank.bin}) {bank.shortName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {bank.name}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});

BankSelect.displayName = 'BankSelect';