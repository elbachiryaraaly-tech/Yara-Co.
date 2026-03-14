export const countriesConfig = [
    // EUROPA OCCIDENTAL (precios base)
    { code: "ES", name: "España", shippingStandard: 4.99, shippingExpress: 12.99, currency: "EUR" },
    { code: "PT", name: "Portugal", shippingStandard: 5.99, shippingExpress: 14.99, currency: "EUR" },
    { code: "FR", name: "Francia", shippingStandard: 6.99, shippingExpress: 16.99, currency: "EUR" },
    { code: "IT", name: "Italia", shippingStandard: 6.99, shippingExpress: 16.99, currency: "EUR" },
    { code: "DE", name: "Alemania", shippingStandard: 5.99, shippingExpress: 15.99, currency: "EUR" },

    // EUROPA NORTE Y BENELUX
    { code: "GB", name: "Reino Unido", shippingStandard: 8.99, shippingExpress: 19.99, currency: "EUR" },
    { code: "NL", name: "Países Bajos", shippingStandard: 5.99, shippingExpress: 15.99, currency: "EUR" },
    { code: "BE", name: "Bélgica", shippingStandard: 5.99, shippingExpress: 15.99, currency: "EUR" },
    { code: "CH", name: "Suiza", shippingStandard: 9.99, shippingExpress: 21.99, currency: "EUR" },
    { code: "AT", name: "Austria", shippingStandard: 6.99, shippingExpress: 16.99, currency: "EUR" },
    { code: "IE", name: "Irlanda", shippingStandard: 7.99, shippingExpress: 17.99, currency: "EUR" },

    // EUROPA ESTE Y NORTE
    { code: "SE", name: "Suecia", shippingStandard: 8.99, shippingExpress: 19.99, currency: "EUR" },
    { code: "DK", name: "Dinamarca", shippingStandard: 7.99, shippingExpress: 17.99, currency: "EUR" },
    { code: "NO", name: "Noruega", shippingStandard: 9.99, shippingExpress: 21.99, currency: "EUR" },
    { code: "FI", name: "Finlandia", shippingStandard: 8.99, shippingExpress: 19.99, currency: "EUR" },
    { code: "PL", name: "Polonia", shippingStandard: 7.99, shippingExpress: 18.99, currency: "EUR" },
    { code: "CZ", name: "República Checa", shippingStandard: 8.99, shippingExpress: 19.99, currency: "EUR" },
    { code: "HU", name: "Hungría", shippingStandard: 8.99, shippingExpress: 19.99, currency: "EUR" },
    { code: "RO", name: "Rumanía", shippingStandard: 9.99, shippingExpress: 20.99, currency: "EUR" },
    { code: "GR", name: "Grecia", shippingStandard: 9.99, shippingExpress: 20.99, currency: "EUR" },

    // AMÉRICA DEL NORTE
    { code: "US", name: "Estados Unidos", shippingStandard: 12.99, shippingExpress: 29.99, currency: "EUR" },
    { code: "CA", name: "Canadá", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },

    // ASIA-PACÍFICO
    { code: "AU", name: "Australia", shippingStandard: 16.99, shippingExpress: 36.99, currency: "EUR" },
    { code: "JP", name: "Japón", shippingStandard: 15.99, shippingExpress: 34.99, currency: "EUR" },
    { code: "KR", name: "Corea del Sur", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },
    { code: "CN", name: "China", shippingStandard: 13.99, shippingExpress: 30.99, currency: "EUR" },
    { code: "TH", name: "Tailandia", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },
    { code: "SG", name: "Singapur", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },
    { code: "MY", name: "Malasia", shippingStandard: 15.99, shippingExpress: 34.99, currency: "EUR" },
    { code: "PH", name: "Filipinas", shippingStandard: 15.99, shippingExpress: 34.99, currency: "EUR" },
    { code: "VN", name: "Vietnam", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },
    { code: "HK", name: "Hong Kong", shippingStandard: 13.99, shippingExpress: 30.99, currency: "EUR" },
    { code: "TW", name: "Taiwán", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },

    // MEDIO ORIENTE
    { code: "AE", name: "Emiratos Árabes", shippingStandard: 13.99, shippingExpress: 30.99, currency: "EUR" },
    { code: "SA", name: "Arabia Saudita", shippingStandard: 14.99, shippingExpress: 32.99, currency: "EUR" },
    { code: "TR", name: "Turquía", shippingStandard: 12.99, shippingExpress: 28.99, currency: "EUR" },
];

export const FREE_SHIPPING_THRESHOLD = 150;

export function getShippingCost(countryCode: string, method: "standard" | "express", subtotal: number): number {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return 0;
    }

    const country = countriesConfig.find(c => c.code === countryCode) || countriesConfig[0];

    if (method === "express") {
        return country.shippingExpress;
    }

    return country.shippingStandard;
}
