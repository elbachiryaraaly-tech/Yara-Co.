import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExistingVariantIds() {
  console.log('🔧 Actualizando IDs de variantes de productos existentes...');
  
  try {
    // Obtener todas las variantes que no tienen providerVariantId
    const variants = await prisma.productVariant.findMany({
      where: {
        OR: [
          { providerVariantId: null },
          { providerVariantId: '' },
        ],
      },
      include: {
        product: {
          select: {
            providerProductId: true,
            name: true,
          },
        },
      },
    });

    console.log(`📦 Encontradas ${variants.length} variantes sin providerVariantId`);

    for (const variant of variants) {
      let newProviderVariantId: string;
      
      // Si el producto tiene un providerProductId de CJ, generar un ID basado en eso
      if (variant.product.providerProductId) {
        newProviderVariantId = `${variant.product.providerProductId}-${variant.name.replace(/\s+/g, '-').toLowerCase()}`;
      } else {
        // Si no, generar un ID basado en el SKU o nombre
        newProviderVariantId = variant.sku || `${variant.name.replace(/\s+/g, '-').toLowerCase()}`;
      }

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { providerVariantId: newProviderVariantId },
      });
      
      console.log(`✅ Actualizada variante "${variant.name}" del producto "${variant.product.name}" -> ${newProviderVariantId}`);
    }

    console.log('🎉 ¡Todas las variantes han sido actualizadas!');
  } catch (error) {
    console.error('❌ Error al actualizar variantes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixExistingVariantIds();
