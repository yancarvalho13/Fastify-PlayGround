
import { error } from "console";
import type { UUID } from "crypto";
import { fastify, type FastifyInstance, type FastifyPluginOptions } from "fastify";
import { Client } from "pg";

interface user {
    id?: UUID
    name: string,
    email: string
}

interface todo {
    title: string,
    tasks: task[]
}

interface task {
    description: string,
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

    type TodoBody = {
        title: string;
        tasks: {description: string}[];
    }

    fastify.post<{Params: {user_id: string},Body: TodoBody}>('/todo/:user_id', async(req, repl) => {
        const {user_id} = req.params;
        const {title, tasks = []} = req.body;

        //Insete o TODO E pega o id
        try{

            const {rows} = await fastify.pg.query(
                "INSERT INTO todo (title,user_id) VALUES ($1, $2) RETURNING id",
                [title, user_id]
            );
            const todoId = rows[0].id;
            
            for (const t of tasks){
                await fastify.pg.query("INSERT INTO tasks (todo_id, description) VALUES ($1, $2)",
                [todoId, t.description]
            );
        }
        
        
        return repl.code(201).send(todoId);
        }catch (err) {
            req.log.error(err)
            return repl.code(500).send({error: "Erro ao criar todo e tasks"})
        }

    })

}

export default routes;
