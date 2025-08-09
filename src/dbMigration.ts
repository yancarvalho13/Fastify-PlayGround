import { fastify, type FastifyInstance, type FastifyPluginOptions } from 'fastify';


import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg'
import Postgrator from 'postgrator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

async function migrate() {
    const client = new pg.Client({
        host: 'localhost',
        port: 5432,
        database: 'fastifyDB',
        user: 'admin',
        password: '123456',
    });

    try {
        await client.connect();

        const postgrator = new Postgrator({
            migrationPattern: path.join(__dirname, '../src/migrations/*'),
            driver: 'pg',
            database: 'fastifyDB',
            schemaTable: 'migrations',
            currentSchema: 'public',
            execQuery: (query) => client.query(query)
        });

        const result = await postgrator.migrate();

        if (result.length === 0) {
            console.log(
                'No migrations run for schema "public"'
            )
        }

        console.log("Migration done.")

        process.exitCode = 0
    }catch(err){
        console.error(err);
        process.exitCode = 1      
    }
    await client.end();
}

export default async function dbMigrationPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.log.info("Runing database migrations...");
    await migrate();
    fastify.log.info("Migrations completed")
    
}