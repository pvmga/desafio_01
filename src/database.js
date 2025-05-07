// com promises (da pra trabalhar async await)

import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8').then(data => {
            this.#database = JSON.parse(data)
        })
        .catch(() => {
            this.#persist()
        })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id == id)
        
        if (rowIndex > -1) {
            const tasks = this.#database[table][rowIndex]
            const created_at = tasks.created_at
            const completed_at = tasks.completed_at
            const updated_at = new Date()

            const dados = {
                ...data,
                completed_at,
                created_at,
                updated_at
            }

            this.#database[table][rowIndex] = { id, ...dados }
            // console.log(this.#database[table][rowIndex])
            this.#persist()
        } else {
            return false
        }
    }

    patch(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id == id)

        if (rowIndex > -1) {
            const tasks = this.#database[table][rowIndex]
            const completed_at = new Date()
            const dados = {
                ...tasks,
                completed_at
            }
            
            this.#database[table][rowIndex] = dados
            // console.log(this.#database[table][rowIndex])
            this.#persist()
        } else {
            return false
        }
        
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id == id)

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        } else {
            return false
        }
    }
}