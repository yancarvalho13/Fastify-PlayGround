
import type { UUID } from "crypto";
import { fastify, type FastifyInstance, type FastifyPluginOptions } from "fastify";
import { Client } from "pg";

interface user {
    id?: UUID
    name: string,
    email: string
}

const yan: user = {
    name: "Yan Carvalho",
    email: "yansilva@gmail.com"
}




async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const userBodyJsonSchema = {
    type: 'object',
    required: ['name','email'],
    properties: {
        name: {type: 'string'},
        email: {type: 'string'}
    },
    }

    const userSchema = {
    body: userBodyJsonSchema,
    }    

    fastify.get('/', async (request, reply) => {
        return {hello: "world"}
    })

    fastify.get<{Params: {name: string}}>('/users/:name', async (request, reply) => {
        const {name} = request.params

        const {rows} = await fastify.pg.query<user>(
            "SELECT id, name, email FROM users WHERE name ILIKE $1",
            [name]
        );

        fastify.log.info(request.params.name)

        if(rows.length === 0){
            return reply.code(404).send({message: "User not found"})
        }

        return rows;
        
    })


    fastify.post<{Body: user}>('/user', {schema: userSchema}, async (request, reply) => {
        const {name, email} = request.body;
        
        const {rows} = await fastify.pg.query(
            "INSERT INTO users (name,email) VALUES ($1, $2) RETURNING id, name, email",
            [name, email]
        );

        reply.code(201)
        return rows[0]
    }
    );

}

export default routes;
