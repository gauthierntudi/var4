import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient()
  console.log('--- Test de connexion à la base de données ---')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurée' : 'Manquante')
  
  try {
    console.log('Tentative de connexion...')
    await prisma.$connect()
    console.log('✅ Succès : Connexion établie avec succès.')
    
    const count = await prisma.inscription.count()
    console.log(`📊 Données : ${count} inscription(s) trouvée(s).`)
    
  } catch (error) {
    console.error('❌ Échec : Impossible de se connecter à la base de données.')
    if (error instanceof Error) {
      console.error('Erreur :', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
