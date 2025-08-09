

import Fastify from "fastify";
import firstRoute from "./firstRoute.js";
import dbMigrationPlugin from "./dbMigration.js";
import fastifyPostgres from "@fastify/postgres";


const fastify = Fastify({
    logger: true
})

fastify.register((fastifyPostgres), {
    connectionString: "postgres://admin:123456@127.0.0.1:5432/fastifyDB"
   });
fastify.register(dbMigrationPlugin)
fastify.register(firstRoute);



fastify.listen({port: 3000}, function(err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})