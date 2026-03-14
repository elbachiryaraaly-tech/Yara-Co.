import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateSkus() {
  console.log('🔧 Arreglando SKUs duplicados en variantes existentes...');
  
  try {
    // Encontrar todas las variantes agrupadas por SKU para encontrar duplicados
    const duplicateSkus = await prisma.productVariant.groupBy({
      by: ['sku'],
      where: {
        sku: {
          not: null,
        },
      },
      having: {
        sku: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (duplicateSkus.length === 0) {
      console.log('✅ No hay SKUs duplicados');
      return;
    }

    console.log(`📦 Encontrados ${duplicateSkus.length} SKUs duplicados`);

    for (const duplicate of duplicateSkus) {
      const sku = duplicate.sku;
      
      // Obtener todas las variantes con este SKU
      const variants = await prisma.productVariant.findMany({
        where: { sku },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      console.log(`\n🔄 Procesando SKU duplicado: "${sku}" (${variants.length} variantes)`);

      // Mantener el primer SKU como está, añadir sufijo a los demás
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        
        if (i === 0) {
          console.log(`  ⏭️  Manteniendo: ${variant.name} (${variant.product.name}) -> "${sku}"`);
          continue;
        }

        const newSku = `${sku}-${i + 1}`;
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { sku: newSku },
        });
        
        console.log(`  ✅ Actualizado: ${variant.name} (${variant.product.name}) -> "${newSku}"`);
      }
    }

    console.log('\n🎉 ¡Todos los SKUs duplicados han sido arreglados!');
  } catch (error) {
    console.error('❌ Error al arreglar SKUs duplicados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixDuplicateSkus();
