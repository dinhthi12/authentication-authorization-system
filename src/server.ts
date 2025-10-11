import app from './app'
import { config } from './config'

async function startServer() {
  app.listen(config.app.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.app.port}`)
  })
}

startServer()
