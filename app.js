const express = require('express')
const analysisRouter = require('./routes/analysisRouter');

const app = express()
const port = 3000

app.get('/', async (req, res) => {
    res.send('Hello Stew!')
})

app.use('/analysis', analysisRouter);

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})