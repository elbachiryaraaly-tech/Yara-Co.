"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Phone, Check, X } from "lucide-react";
import { countryPhoneCodes, getPhoneCodeByCountry, CountryPhoneCode, validatePhoneNumber } from "@/data/phoneCodes";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  selectedCountry?: string;
  className?: string;
  placeholder?: string;
  error?: string;
}

export function PhoneInput({ 
  value, 
  onChange, 
  selectedCountry, 
  className = "",
  placeholder = "Número de teléfono",
  error
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCode, setSelectedCode] = useState<CountryPhoneCode>(
    selectedCountry ? getPhoneCodeByCountry(selectedCountry) || countryPhoneCodes[0] : countryPhoneCodes[0]
  );
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar el código cuando cambia el país (sin modificar el número)
  useEffect(() => {
    if (selectedCountry) {
      const newCode = getPhoneCodeByCountry(selectedCountry);
      if (newCode && newCode.code !== selectedCode.code) {
        setSelectedCode(newCode);
      }
    }
  }, [selectedCountry]);

  // Validación en tiempo real desactivada para no molestar
  useEffect(() => {
    // No validar en tiempo real para evitar frustración
    setIsValid(null);
  }, [value, selectedCode.code]);

  const handleCodeSelect = (code: CountryPhoneCode) => {
    setSelectedCode(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Solo permitir números
    newValue = newValue.replace(/\D/g, '');
    
    // Limitar a 15 dígitos máximo
    if (newValue.length > 15) {
      newValue = newValue.substring(0, 15);
    }
    
    // Guardar solo el número sin código de país
    onChange(newValue);
  };

  // Sin formateo - mostrar el número tal cual
  const formatDisplayValue = (phone: string) => {
    return phone || "";
  };

  // Filtrar países por término de búsqueda
  const filteredCountries = countryPhoneCodes.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = () => {
    // Siempre mostrar color neutro
    return "text-muted-foreground";
  };

  const getStatusIcon = () => {
    // No mostrar iconos de estado
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Selector de código de país */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-2 bg-[var(--elevated)] border border-r-0 rounded-l-lg transition-all min-w-[110px] ${
              isFocused ? "border-[var(--gold)]" : "border-[var(--border)]"
            } ${error ? "border-red-500" : ""} hover:bg-[var(--muted)]`}
          >
            <span className="text-lg">{selectedCode.flag}</span>
            <span className="text-sm font-medium text-foreground">{selectedCode.dialCode}</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Desplegable de códigos de país */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-80 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl max-h-80 overflow-hidden">
              {/* Campo de búsqueda */}
              <div className="p-3 border-b border-[var(--border)]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar país o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[var(--elevated)] border border-[var(--border)] rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    autoFocus
                  />
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              {/* Lista de países */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No se encontraron países
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCodeSelect(country)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[var(--muted)] transition-colors text-left border-b border-[var(--border)] last:border-0"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{country.name}</div>
                        <div className="text-xs text-muted-foreground">{country.dialCode}</div>
                      </div>
                      {selectedCode.code === country.code && (
                        <div className="w-5 h-5 bg-[var(--gold)] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-[var(--ink)]" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Campo de número de teléfono */}
        <div className="flex-1 relative">
          <Phone className={`absolute left-3 top-3 h-4 w-4 transition-colors ${getStatusColor()}`} />
          <input
            type="tel"
            value={formatDisplayValue(value)}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="600 000 000 (solo números)"
            className={`w-full pl-10 pr-10 py-2.5 bg-[var(--elevated)] border rounded-r-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent transition-all ${
              isFocused ? "border-[var(--gold)]" : "border-[var(--border)]"
            } ${error ? "border-red-500" : ""}`}
          />
          {getStatusIcon() && (
            <div className={`absolute right-3 top-3 ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
      
      {/* Información simple */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">
          Selecciona tu país y escribe tu número de teléfono
        </p>
        <p className="text-xs text-muted-foreground">
          {selectedCode.name} • {selectedCode.dialCode}
        </p>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
