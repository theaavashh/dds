'use client';

import { useState, useEffect, useMemo } from 'react';
import { productAttributeService, AttributeType } from '@/services/productAttributeService';
import { toast } from 'react-hot-toast';
import { fetchCsrfToken, getCsrfToken } from '@/lib/csrfClient';
import { ChevronDown } from 'lucide-react';

interface DynamicDropdownProps {
  attribute: AttributeType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowCustomValue?: boolean;
  forceDropdown?: boolean; // New prop to force dropdown display
}

interface AttributeOption {
  id: string;
  value: string;
}

export default function DynamicDropdown({
  attribute,
  value,
  onChange,
  placeholder = 'Select or type a value',
  className = '',
  allowCustomValue = true,
  forceDropdown = false // Default to false to maintain current behavior
}: DynamicDropdownProps) {
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState(value || '');
  const [showAddButton, setShowAddButton] = useState(false);

  // State for showing dropdown list
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        const target = event.target as Node;
        const dropdown = document.getElementById(`dropdown-${attribute}`);
        if (dropdown && !dropdown.contains(target)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, attribute]);

  // State for showing add new option input
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');

  // Fetch attribute values when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
        // Ensure we have a CSRF token
        await fetchCsrfToken();
        const csrfToken = getCsrfToken();
              
        const response = await fetch(`${API_BASE_URL}/api/attribute-options/admin/all?attribute=${attribute}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken && { 'x-csrf-token': csrfToken })
          }
        });

        const result = await response.json();

        if (response.ok && result.success && result.data) {
          const optionsData = result.data.map((option: any) => ({
            id: option.id,
            value: option.value
          })).sort((a: AttributeOption, b: AttributeOption) => a.value.localeCompare(b.value));
          
          setOptions(optionsData);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error(`Error fetching ${attribute} options:`, error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [attribute]);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Check if the current input value is a new value not in the options
  useEffect(() => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !options.some((opt: AttributeOption) => opt.value === trimmedInput)) {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
  }, [inputValue, options]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Handle select change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  // Handle dropdown change (for forced dropdown)
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '__add_new__') {
      setShowAddInput(true);
      setNewOptionValue('');
    } else {
      setInputValue(selectedValue);
      onChange(selectedValue);
    }
  };

  // Add new value to the database
  const handleAddNewValue = async () => {
    const trimmedValue = newOptionValue.trim();
    if (!trimmedValue) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      // Ensure we have a CSRF token
      await fetchCsrfToken();
      const csrfToken = getCsrfToken();
      
      const response = await fetch(`${API_BASE_URL}/api/attribute-options/admin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        },
        body: JSON.stringify({
          attribute,
          value: trimmedValue
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear the input field after successful addition
        setNewOptionValue('');
        setShowAddInput(false);
        
        // Notify the service that a new value was added
        productAttributeService.notifyValueChanged(attribute);
        
        // Add a small delay to ensure the API has time to process
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Automatically select the newly added value
        setInputValue(trimmedValue);
        onChange(trimmedValue);
        
        // Refresh the options from the API to ensure the new value is included
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
          // Ensure we have a CSRF token for GET requests too
          await fetchCsrfToken();
          const csrfToken = getCsrfToken();
          
          const response = await fetch(`${API_BASE_URL}/api/attribute-options/admin/all?attribute=${attribute}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(csrfToken && { 'x-csrf-token': csrfToken })
            }
          });

          const result = await response.json();

          if (response.ok && result.success && result.data) {
            const optionsData = result.data.map((option: any) => ({
              id: option.id,
              value: option.value
            })).sort((a: AttributeOption, b: AttributeOption) => a.value.localeCompare(b.value));
            
            setOptions(optionsData);
          }
        } catch (refreshError) {
          console.error('Error refreshing options:', refreshError);
        }
        
        toast.success(`"${trimmedValue}" added successfully!`);
      } else {
        toast.error(result.message || 'Failed to add new value');
      }
    } catch (error) {
      console.error('Error adding new value:', error);
      toast.error('Failed to add new value');
    }
  };

  // Delete an option
  const deleteOption = async (id: string, value: string) => {
    if (!window.confirm(`Are you sure you want to delete "${value}"?`)) {
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      // Ensure we have a CSRF token
      await fetchCsrfToken();
      const csrfToken = getCsrfToken();
      
      const response = await fetch(`${API_BASE_URL}/api/attribute-options/admin/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the options
        productAttributeService.notifyValueChanged(attribute);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
          // Ensure we have a CSRF token for GET requests too
          await fetchCsrfToken();
          const csrfToken = getCsrfToken();
          
          const response = await fetch(`${API_BASE_URL}/api/attribute-options/admin/all?attribute=${attribute}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(csrfToken && { 'x-csrf-token': csrfToken })
            }
          });

          const result = await response.json();

          if (response.ok && result.success && result.data) {
            const optionsData = result.data.map((option: any) => ({
              id: option.id,
              value: option.value
            })).sort((a: AttributeOption, b: AttributeOption) => a.value.localeCompare(b.value));
            
            setOptions(optionsData);
          }
        } catch (refreshError) {
          console.error('Error refreshing options:', refreshError);
        }
        
        toast.success('Option deleted successfully!');
      } else {
        toast.error(result.message || 'Failed to delete option');
      }
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Failed to delete option');
    }
  };

  // Filter options based on input
  // (Removed for simplified implementation)

  // Add custom value to options if it's not already there
  // (Removed for simplified implementation)

  // Show traditional dropdown when forceDropdown is true or when allowCustomValue is false
  const showTraditionalDropdown = forceDropdown || !allowCustomValue;

  return (
    <div className="relative">
      {isLoading ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`${placeholder} (loading...)`}
          className={`${className} bg-gray-100`}
          disabled
        />
      ) : showTraditionalDropdown && allowCustomValue ? (
        // Traditional dropdown with add and delete options
        <div className="flex gap-2">
          <div className="flex-1 relative" id={`dropdown-${attribute}`}>
            <div 
              className={`${className} text-black w-full px-3 py-2 border rounded-lg cursor-pointer flex justify-between items-center`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{inputValue || placeholder}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            
            {/* Dropdown list with add and delete buttons */}
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {options.map((option, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black flex justify-between items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputValue(option.value);
                      onChange(option.value);
                      setShowDropdown(false);
                    }}
                  >
                    <span>{option.value}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOption(option.id, option.value);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div 
                  className="px-4 py-2 hover:bg-purple-100 cursor-pointer font-bold text-purple-700 border-t flex justify-between items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    setShowAddInput(true);
                    setNewOptionValue('');
                  }}
                >
                  <span>+ Add New Option</span>
                </div>
              </div>
            )}
            
            {/* Hidden input for adding new option */}
            {showAddInput && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    placeholder="Enter new option"
                    className="flex-1 px-3 py-2 border rounded-lg text-black"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewValue}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddInput(false);
                      setNewOptionValue('');
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showTraditionalDropdown && !allowCustomValue ? (
        // Traditional dropdown with delete buttons (no custom values allowed)
        <div className="flex gap-2">
          <div className="flex-1 relative" id={`dropdown-${attribute}`}>
            <div 
              className={`${className} text-black w-full px-3 py-2 border rounded-lg cursor-pointer flex justify-between items-center`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{inputValue || placeholder}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            
            {/* Dropdown list with delete buttons */}
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {options.map((option, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black flex justify-between items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInputValue(option.value);
                      onChange(option.value);
                      setShowDropdown(false);
                    }}
                  >
                    <span>{option.value}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOption(option.id, option.value);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : allowCustomValue ? (
        // Input with suggestions (existing behavior)
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`${className} text-black`}
              list={`${attribute}-options`}
            />
            <datalist id={`${attribute}-options`}>
              {options.map((option, index) => (
                <option key={index} value={option.value} />
              ))}
            </datalist>
          </div>
          {showAddButton && (
            <button
              type="button"
              onClick={handleAddNewValue}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
            >
              Add
            </button>
          )}
        </div>
      ) : (
        // Traditional dropdown when allowCustomValue is false
        <select
          value={inputValue || ''}
          onChange={handleSelectChange}
          className={`${className} text-black`}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value} className="text-black">
              {option.value}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
