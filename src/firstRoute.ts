
import { fastify, type FastifyInstance, type FastifyPluginOptions } from "fastify";
import { Client } from "pg";

interface user {
    name: string,
    email: string
}

const yan: user = {
    name: "Yan Carvalho",
    email: "yansilva@gmail.com"
}




async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    

    fastify.get('/', async (request, reply) => {
        return {hello: "world"}
    }),
    fastify.get('/user', async (request, reply) => {
        return {yan}
    })

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
