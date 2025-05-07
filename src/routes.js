import { randomUUID } from "node:crypto"
import { Database } from "./database.js"
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database()

function validateFields(res, body, requiredFields = [], existsId = true) {
    for (const field of requiredFields) {
        // console.log(field == 'id' && existsId === false)
        if (field == 'id' && existsId === false) {
            res.writeHead(400)
            res.end(JSON.stringify({ error: `Id não encontrado.` }))
            return false
        } else if (!body[field]) {
            res.writeHead(400)
            res.end(JSON.stringify({ error: `Campo "${field}" é obrigatório.` }))
            return false
        }
    }

    return true;
}

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if (!validateFields(res, req.body, ['title', 'description'])) return

            // if (!title) {
            //     return res.writeHead(400).end(JSON.stringify({ error: 'Campo "title" é obrigatório.' }))
            // }
            // if (!description) {
            //     return res.writeHead(400).end(JSON.stringify({ error: 'Campo "description" é obrigatório.' }))
            // }

            const tasks = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: null
            }

            database.insert('tasks', tasks)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!validateFields(res, req.body, ['title', 'description'])) return

            const update = database.update('tasks', id, {
                title,
                description
            })

            if (!validateFields(res, req.body, ['id'], update)) return

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const pat = database.patch('tasks', id)

            req.body = {id: id} // apenas para burlar o sistema de validação de campo, pois na API chamamos o body vazio

            if (!validateFields(res, req.body, ['id'], pat)) return

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const del = database.delete('tasks', id)

            if (!validateFields(res, req.body, ['id'], del)) return

            return res.writeHead(204).end()
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {

            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    }
]