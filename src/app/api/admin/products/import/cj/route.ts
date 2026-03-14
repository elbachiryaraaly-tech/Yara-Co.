import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { cjAdapter } from "@/lib/dropshipping/adapters/cj";

// Usaremos un truco: dado que getCachedCjToken no está exportado,
// buscaremos el token directamente usando auth si es necesario, 
// o bien expondremos la lógica de token aquí.
// Pero la forma más fácil es llamar a la API de CJ nosotros mismos con la key guardada.

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { cjProductId } = await req.json();
        if (!cjProductId) {
            return NextResponse.json({ error: "Falta el ID del producto de CJ" }, { status: 400 });
        }

        // 1. Obtener la configuración del proveedor CJ
        const cjProvider = await prisma.dropshippingProvider.findFirst({
            where: { code: "cj" },
        });

        if (!cjProvider || !cjProvider.apiKey || !cjProvider.isActive) {
            return NextResponse.json(
                { error: "El proveedor CJ no está configurado o no está activo. Ve a Admin -> Proveedores y configúralo." },
                { status: 400 }
            );
        }

        const apiKey = cjProvider.apiKey;
        const baseUrl = (cjProvider.baseUrl || "https://developers.cjdropshipping.com/api2.0").replace(/\/$/, "");

        // 2. Obtener Token de CJ
        // Intentaremos usar el accessToken de la BD para evitar el rate limit (1 req / 5 min)
        let token = cjProvider.accessToken;

        // Si no hay token, lo obtenemos (podría fallar por rate limit si se llama seguido)
        if (!token) {
            const authRes = await fetch(`${baseUrl}/v1/authentication/getAccessToken`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey }),
            });

            if (!authRes.ok) {
                if (authRes.status === 429) {
                    return NextResponse.json(
                        { error: "Límite de peticiones de CJ superado (1 petición cada 5 mins). Espera 5 minutos y vuelve a intentarlo." },
                        { status: 429 }
                    );
                }
                return NextResponse.json({ error: "No se pudo obtener el token de CJ." }, { status: 500 });
            }

            const authData = await authRes.json();
            token = authData?.data?.accessToken;

            if (!token) {
                return NextResponse.json({ error: "Respuesta inválida de autenticación de CJ." }, { status: 500 });
            }

            // Guardamos el token en BD para futuras llamadas
            await prisma.dropshippingProvider.update({
                where: { id: cjProvider.id },
                data: { accessToken: token },
            });
        }

        // 3. Obtener detalle del producto de CJ
        const productRes = await fetch(`${baseUrl}/v1/product/query?pid=${cjProductId}`, {
            headers: { "CJ-Access-Token": token! },
        });

        const productJson = await productRes.json();

        if (!productRes.ok || !productJson.result || !productJson.data) {
            // Si falló por autorización (token expirado), podríamos limpiar el token y pedir al usuario que reintente
            if (productRes.status === 401 || productJson.code === 401) {
                await prisma.dropshippingProvider.update({
                    where: { id: cjProvider.id },
                    data: { accessToken: null },
                });
                return NextResponse.json({ error: "Token de CJ caducado. Vuelve a intentarlo en unos segundos." }, { status: 401 });
            }

            return NextResponse.json(
                { error: productJson.message || "No se encontró el producto en CJ." },
                { status: 404 }
            );
        }

        const cjData = productJson.data;

        // 4. Preparar datos para Prisma
        const name = cjData.productNameEn || cjData.productName || "CJ Product " + cjProductId;

        // Calcular un slug único
        const baseSlug = slugify(name);
        let slug = baseSlug;
        let suffix = 0;
        while (true) {
            const existing = await prisma.product.findUnique({ where: { slug } });
            if (!existing) break;
            suffix += 1;
            slug = `${baseSlug}-${suffix}`;
        }

        // Fotos principales
        let imageSetUrls: string[] = [];
        if (typeof cjData.productImageSet === "string") {
            try {
                // Puede venir como string de array: "['url1','url2']"
                // Reemplazar comillas simples por dobles para que JSON.parse funcione si es el caso
                const safeString = cjData.productImageSet.replace(/'/g, '"');
                imageSetUrls = JSON.parse(safeString);
            } catch (e) {
                // Si falla el parseo, lo ignoramos y usamos productImage
                imageSetUrls = [];
            }
        } else if (Array.isArray(cjData.productImageSet)) {
            imageSetUrls = cjData.productImageSet;
        }

        const mainImages = imageSetUrls.map((url: string, index: number) => ({
            url: url,
            alt: name,
            order: index,
        }));
        // Si productImageUrl está y no está en el array, añadirla
        if (cjData.productImage && !mainImages.find((img: any) => img.url === cjData.productImage)) {
            mainImages.unshift({ url: cjData.productImage, alt: name, order: 0 });
        }
        // Límite de 10 imágenes
        const truncatedImages = mainImages.slice(0, 10);

        // Variantes
        const cjVariants = cjData.variants || [];
        let minPrice: number | null = null;
        let maxPrice: number | null = null;

        const parsedVariants = cjVariants.map((v: any) => {
            const price = parseFloat(v.sellPrice) || parseFloat(cjData.sellPrice) || 0;
            if (minPrice === null || price < minPrice) minPrice = price;
            if (maxPrice === null || price > maxPrice) maxPrice = price;

            // Intentar construir el nombre de variante (Talla, Color)
            let variantName = v.variantNameEn || v.variantName || v.varkey || "Estándar";

            return {
                name: variantName,
                sku: v.variantSku || "",
                providerVariantId: v.vid || v.variantSku, // VID de CJ (UUID) es preferible
                price: price * 2.0, // PRECIO SUGERIDO: 100% de margen base como partida
                compareAtPrice: price * 3.0, // Precio tachado de partida
                stock: parseInt(v.variantInventory) || 0,
                imageUrl: v.variantImage || null,
                options: v.variantKey ? { property: v.variantKey } : {},
            };
        });

        // Precio base del producto será el más bajo de las variantes (con margen)
        const basePrice = minPrice !== null ? minPrice * 2.0 : (parseFloat(cjData.sellPrice) || 0) * 2.0;
        const baseCompare = minPrice !== null ? minPrice * 3.0 : (parseFloat(cjData.sellPrice) || 0) * 3.0;

        // 5. Crear Producto en Base de Datos
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description: cjData.description || `Importado de CJ Dropshipping (ID: ${cjProductId})`,
                shortDescription: cjData.productType || "CJ Product",
                price: basePrice,
                compareAtPrice: baseCompare,
                costPrice: minPrice || parseFloat(cjData.sellPrice) || 0,
                sku: cjData.productSku || cjProductId,
                stock: cjVariants.reduce((acc: number, v: any) => acc + (parseInt(v.variantInventory) || 0), 0) || 10,
                trackInventory: true,
                isActive: true, // El usuario solicitó que estén visibles por defecto
                providerId: cjProvider.id,
                providerProductId: cjProductId, // IMPORTANTE para Dropshipping
                weight: parseFloat(cjData.productWeight) || null,
            },
        });

        // Crear imágenes
        if (truncatedImages.length > 0) {
            await prisma.productImage.createMany({
                data: truncatedImages.map((img: any, i: number) => ({
                    productId: product.id,
                    url: img.url,
                    alt: img.alt,
                    order: i,
                })),
            });
        }

        // Crear variantes
        if (parsedVariants.length > 0) {
            await prisma.productVariant.createMany({
                data: parsedVariants.map((v: any) => ({
                    productId: product.id,
                    name: v.name,
                    sku: v.sku || null,
                    providerVariantId: v.providerVariantId, // IMPORTANTE
                    price: v.price,
                    compareAtPrice: v.compareAtPrice,
                    stock: v.stock,
                    imageUrl: v.imageUrl,
                    options: JSON.stringify(v.options),
                })),
            });
        }

        return NextResponse.json({
            success: true,
            id: product.id,
            slug: product.slug,
            message: "Producto importado como Inactivo correctamente."
        });

    } catch (error) {
        console.error("Error importando desde CJ:", error);
        return NextResponse.json(
            { error: "Error interno importando el producto de CJ." },
            { status: 500 }
        );
    }
}
