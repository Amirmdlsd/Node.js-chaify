const express = require('express')
const http = require('http')
const router = require('./routes')
const { json } = require('stream/consumers')

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded())

require('./socket')(server)

app.use('/api', router)

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Listening on port ${port}`))
