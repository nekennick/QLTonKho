'use client';

import * as React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DataTableFacetedFilterProps<TData, TValue> {
  column: any;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 border-dashed text-sm px-3 max-w-[120px] sm:max-w-[180px] lg:max-w-none"
        >
          <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{title}</span>
          {selectedValues?.size > 0 && (
            <>
              <DropdownMenuSeparator className="mx-2 h-4 flex-shrink-0" />
              <Badge 
                variant="secondary" 
                className="rounded-sm px-2 text-xs font-normal flex-shrink-0 min-w-0"
              >
                <span className="truncate">
                  {selectedValues.size > 2 
                    ? `${selectedValues.size} đã chọn`
                    : selectedValues.size === 1 
                      ? options.find(option => selectedValues.has(option.value))?.label?.slice(0, 8) + '...'
                      : `${selectedValues.size} đã chọn`
                  }
                </span>
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] sm:w-[320px] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command>
          <CommandInput 
            placeholder={`Tìm kiếm ${title?.toLowerCase()}...`} 
            className="text-sm"
          />
          <CommandList>
            <CommandEmpty className="text-sm py-4">Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                    className="text-sm py-2"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary flex-shrink-0',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="truncate flex-1 min-w-0">{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs flex-shrink-0 bg-gray-100 rounded">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center text-sm py-2 text-red-600 hover:text-red-700"
                  >
                    Xóa tất cả bộ lọc
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
