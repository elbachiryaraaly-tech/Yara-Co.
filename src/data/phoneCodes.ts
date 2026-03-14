export interface CountryPhoneCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const countryPhoneCodes: CountryPhoneCode[] = [
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "FR", name: "Francia", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹" },
  { code: "DE", name: "Alemania", dialCode: "+49", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", dialCode: "+44", flag: "🇬🇧" },
  { code: "NL", name: "Países Bajos", dialCode: "+31", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", dialCode: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Suiza", dialCode: "+41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "IE", name: "Irlanda", dialCode: "+353", flag: "🇮🇪" },
  { code: "SE", name: "Suecia", dialCode: "+46", flag: "🇸🇪" },
  { code: "DK", name: "Dinamarca", dialCode: "+45", flag: "🇩🇰" },
  { code: "NO", name: "Noruega", dialCode: "+47", flag: "🇳🇴" },
  { code: "FI", name: "Finlandia", dialCode: "+358", flag: "🇫🇮" },
  { code: "PL", name: "Polonia", dialCode: "+48", flag: "🇵🇱" },
  { code: "CZ", name: "República Checa", dialCode: "+420", flag: "🇨🇿" },
  { code: "HU", name: "Hungría", dialCode: "+36", flag: "🇭🇺" },
  { code: "RO", name: "Rumanía", dialCode: "+40", flag: "🇷🇴" },
  { code: "GR", name: "Grecia", dialCode: "+30", flag: "🇬🇷" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "JP", name: "Japón", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", dialCode: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "TH", name: "Tailandia", dialCode: "+66", flag: "🇹🇭" },
  { code: "SG", name: "Singapur", dialCode: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malasia", dialCode: "+60", flag: "🇲🇾" },
  { code: "PH", name: "Filipinas", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰" },
  { code: "TW", name: "Taiwán", dialCode: "+886", flag: "🇹🇼" },
  { code: "AE", name: "Emiratos Árabes", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Arabia Saudita", dialCode: "+966", flag: "🇸🇦" },
  { code: "TR", name: "Turquía", dialCode: "+90", flag: "🇹🇷" },
];

// Función para obtener el código de teléfono por país
export function getPhoneCodeByCountry(countryCode: string): CountryPhoneCode | null {
  return countryPhoneCodes.find(country => country.code === countryCode) || null;
}

// Función para validar número de teléfono - MUY PERMISIVA
export function validatePhoneNumber(phone: string, countryCode: string): boolean {
  const phoneCode = getPhoneCodeByCountry(countryCode);
  if (!phoneCode) return false;
  
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Verificar que comience con el código de país
  if (!cleanPhone.startsWith(phoneCode.dialCode)) {
    return false;
  }
  
  // Extraer el número sin el código de país
  const phoneNumber = cleanPhone.substring(phoneCode.dialCode.length);
  
  // Validación muy simple: solo números y longitud mínima
  return phoneNumber.length >= 6 && phoneNumber.length <= 20 && /^\d+$/.test(phoneNumber);
}

// Función para obtener la longitud válida del número por país
function getPhoneNumberLength(countryCode: string): { min: number; max: number } | null {
  const lengthRules: { [key: string]: { min: number; max: number } } = {
    // Europa - rangos más flexibles
    ES: { min: 8, max: 12 },  // España: 8-12 dígitos (antes 9-9)
    PT: { min: 8, max: 12 },  // Portugal: 8-12 dígitos (antes 9-9)
    FR: { min: 8, max: 12 },  // Francia: 8-12 dígitos (antes 9-9)
    IT: { min: 8, max: 12 }, // Italia: 8-12 dígitos (antes 9-10)
    DE: { min: 9, max: 13 }, // Alemania: 9-13 dígitos (antes 10-11)
    GB: { min: 9, max: 12 }, // Reino Unido: 9-12 dígitos (antes 10-11)
    NL: { min: 8, max: 11 },  // Países Bajos: 8-11 dígitos (antes 9-9)
    BE: { min: 8, max: 11 },  // Bélgica: 8-11 dígitos (antes 9-9)
    CH: { min: 8, max: 12 }, // Suiza: 8-12 dígitos (antes 9-10)
    AT: { min: 9, max: 14 }, // Austria: 9-14 dígitos (antes 10-13)
    IE: { min: 8, max: 11 },  // Irlanda: 8-11 dígitos (antes 9-9)
    SE: { min: 8, max: 14 }, // Suecia: 8-14 dígitos (antes 9-13)
    DK: { min: 7, max: 10 },  // Dinamarca: 7-10 dígitos (antes 8-8)
    NO: { min: 7, max: 10 },  // Noruega: 7-10 dígitos (antes 8-8)
    FI: { min: 8, max: 13 }, // Finlandia: 8-13 dígitos (antes 9-12)
    PL: { min: 8, max: 11 },  // Polonia: 8-11 dígitos (antes 9-9)
    CZ: { min: 8, max: 11 },  // República Checa: 8-11 dígitos (antes 9-9)
    HU: { min: 8, max: 11 },  // Hungría: 8-11 dígitos (antes 9-9)
    RO: { min: 8, max: 12 }, // Rumanía: 8-12 dígitos (antes 9-10)
    GR: { min: 9, max: 12 }, // Grecia: 9-12 dígitos (antes 10-10)
    
    // América
    US: { min: 9, max: 11 }, // Estados Unidos: 9-11 dígitos (antes 10-10)
    CA: { min: 9, max: 11 }, // Canadá: 9-11 dígitos (antes 10-10)
    
    // Asia-Pacífico
    AU: { min: 8, max: 12 }, // Australia: 8-12 dígitos (antes 9-10)
    JP: { min: 9, max: 12 }, // Japón: 9-12 dígitos (antes 10-11)
    KR: { min: 8, max: 12 }, // Corea del Sur: 8-12 dígitos (antes 9-11)
    CN: { min: 10, max: 12 }, // China: 10-12 dígitos (antes 11-11)
    TH: { min: 8, max: 12 }, // Tailandia: 8-12 dígitos (antes 9-10)
    SG: { min: 7, max: 10 },  // Singapur: 7-10 dígitos (antes 8-8)
    MY: { min: 8, max: 12 }, // Malasia: 8-12 dígitos (antes 9-10)
    PH: { min: 9, max: 12 }, // Filipinas: 9-12 dígitos (antes 10-10)
    VN: { min: 8, max: 12 }, // Vietnam: 8-12 dígitos (antes 9-11)
    HK: { min: 7, max: 10 },  // Hong Kong: 7-10 dígitos (antes 8-8)
    TW: { min: 8, max: 11 },  // Taiwán: 8-11 dígitos (antes 9-9)
    
    // Medio Oriente
    AE: { min: 8, max: 12 },  // Emiratos Árabes: 8-12 dígitos (antes 9-9)
    SA: { min: 8, max: 12 },  // Arabia Saudita: 8-12 dígitos (antes 9-9)
    TR: { min: 9, max: 12 }, // Turquía: 9-12 dígitos (antes 10-10)
  };
  
  return lengthRules[countryCode] || null;
}

// Función para formatear número de teléfono para mostrar
export function formatPhoneNumber(phone: string, countryCode: string): string {
  const phoneCode = getPhoneCodeByCountry(countryCode);
  if (!phoneCode) return phone;
  
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Separar el código del país del número
  if (!cleanPhone.startsWith(phoneCode.dialCode)) return phone;
  
  const phoneNumber = cleanPhone.substring(phoneCode.dialCode.length);
  
  // Formatear según el país
  switch (countryCode) {
    case 'ES':
    case 'PT':
    case 'FR':
    case 'NL':
    case 'BE':
    case 'IE':
    case 'PL':
    case 'CZ':
    case 'HU':
    case 'TW':
      if (phoneNumber.length === 9) {
        return `${phoneCode.dialCode} ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
      }
      break;
      
    case 'US':
    case 'CA':
      if (phoneNumber.length === 10) {
        return `${phoneCode.dialCode} (${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
      }
      break;
      
    case 'GB':
      if (phoneNumber.length === 10) {
        return `${phoneCode.dialCode} ${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
      } else if (phoneNumber.length === 11) {
        return `${phoneCode.dialCode} ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5, 9)} ${phoneNumber.slice(9)}`;
      }
      break;
  }
  
  // Formato genérico si no hay regla específica
  if (phoneNumber.length <= 3) return cleanPhone;
  if (phoneNumber.length <= 6) return `${phoneCode.dialCode} ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
  if (phoneNumber.length <= 9) return `${phoneCode.dialCode} ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
  
  return `${phoneCode.dialCode} ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 9)} ${phoneNumber.slice(9)}`;
}
