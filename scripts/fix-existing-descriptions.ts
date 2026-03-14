import { PrismaClient } from '@prisma/client';
import { cleanHtmlDescription } from '../src/lib/utils';

const prisma = new PrismaClient();

async function fixExistingDescriptions() {
  console.log('🧹 Limpiando descripciones de productos existentes...');
  
  try {
    // Obtener todos los productos que tienen descripción
    const products = await prisma.product.findMany({
      where: {
        description: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    console.log(`📦 Encontrados ${products.length} productos con descripción`);

    for (const product of products) {
      if (!product.description) continue;

      const cleanedDescription = cleanHtmlDescription(product.description);
      
      // Solo actualizar si la descripción cambió
      if (cleanedDescription !== product.description) {
        await prisma.product.update({
          where: { id: product.id },
          data: { description: cleanedDescription },
        });
        
        console.log(`✅ Actualizado: ${product.name}`);
      } else {
        console.log(`⏭️  Sin cambios: ${product.name}`);
      }
    }

    console.log('🎉 ¡Todas las descripciones han sido limpiadas!');
  } catch (error) {
    console.error('❌ Error al limpiar descripciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixExistingDescriptions();
