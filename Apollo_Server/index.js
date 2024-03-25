import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import db from "./_db.js";
import {dbSchema} from "./mongodb.js"
import { MongoClient } from "mongodb";

const MONGODB =
  "mongodb+srv://apollo:jZ2ivZa5K$db$qS@testapolloserver.vy77x15.mongodb.net/";
const resolvers = {
  Query: {
    async games() {
      return await dbSchema.game;
    },
    authors() {
      return db.authors;
    },
    reviews() {
      return db.reviews;
    },
    review(_, args) {
      return db.reviews.find((review) => review.id === args.id);
    },
    game(_, args) {
      return db.games.find((game) => game.id === args.id);
    },
    author(_, args) {
      return db.authors.find((author) => author.id === args.id);
    },
  },
  Game: {
    reviews(parent) {
      return db.reviews.filter((r) => r.game_id === parent.id);
    },
  },
  Author: {
    reviews(parent) {
      return db.reviews.filter((r) => r.author_id === parent.id);
    },
  },
  Review: {
    author(parent) {
      return db.authors.find((author) => author.id === parent.author_id);
    },
    game(parent) {
      return db.games.find((game) => game.id === parent.game_id);
    },
  },
  Mutation: {
    deleteGame(_, args) {
      return db.games.filter((g) => g.id !== args.id);
    },
    addGame(_, args) {
      let game = {
        id: Math.floor(Math.random() * 100).toString(),
        ...args.game,
      };
      db.games.push(game);
      return game;
    },
    updateGame(_, args) {
      db.games = db.games.map((g) => {
        if (g.id === args.id) {
          return { ...g, ...args.edits };
        }
        return g;
      });
      return db.games.find((g) => g.id === args.id);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const client = new MongoClient(MONGODB);
async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to Atlas");
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
run()
  .catch(console.dir)
  .then(async () => {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });
    console.log("Listening on port 4000");
  })
