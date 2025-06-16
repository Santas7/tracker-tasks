import express, {Express} from 'express'

const app: Express = express()
app.use(express.json())

app.listen('5000', () => {
    console.log(`сервер запущен!`);
});