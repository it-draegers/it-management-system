import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local")
}

const uri = process.env.MONGODB_URI

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)

    global._mongoClientPromise = client
      .connect()
      .then(async (c) => {
        await c.db().command({ ping: 1 })
        console.log("✅ MongoDB connected successfully")
        return c
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:")
        console.error(err)
        throw err
      })
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)

  clientPromise = client
    .connect()
    .then(async (c) => {
      await c.db().command({ ping: 1 })
      console.log("✅ MongoDB connected successfully (production)")
      return c
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:")
      console.error(err)
      throw err
    })
}

export default clientPromise

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db("it-management")
}
