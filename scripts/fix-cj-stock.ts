import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStockFromCJ() {
  console.log('🔧 Corrigiendo stock de productos importados de CJ...');

  try {
    // Get all products from CJ provider that have variants
    const cjProducts = await prisma.product.findMany({
      where: {
        providerId: {
          not: null,
        },
      },
      include: {
        variants: true,
      },
    });

    console.log(`📦 Encontrados ${cjProducts.length} productos de proveedores externos`);

    for (const product of cjProducts) {
      if (product.variants.length === 0) continue;

      // Recalculate total stock from variants
      const totalStock = product.variants.reduce((acc, variant) => acc + variant.stock, 0);

      if (totalStock !== product.stock) {
        console.log(`📊 Actualizando stock del producto "${product.name}": ${product.stock} -> ${totalStock}`);
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: totalStock },
        });
      } else {
        console.log(`✅ Stock correcto para "${product.name}": ${totalStock}`);
      }
    }

    console.log('🎉 ¡Corrección de stock completada!');
  } catch (error) {
    console.error('❌ Error al corregir stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixStockFromCJ();
