const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongodb = require('mongodb');
const MessageDAO = require('./dao/MessageDAO.js');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const MessageRoute = require('./api/routes/chat.js');

const app = express();

class Index {
    static app = express();
    static router = express.Router();

    static createServer() {
        Index.app.use(cors({origin: 'http://localhost:3000'}));
        Index.app.use(express.json());

        const swaggerOption = {
            swaggerDefinition: (swaggerJsdoc.Options = {
                info: {
                    title: "my-users app", description: "API documentation", contact: {
                        name: "LLAURET",
                    }, servers: ["http://localhost:3030/"],
                },
            }), apis: ["./api/routes/*.js"],
        };

        const swaggerDocs = swaggerJsdoc(swaggerOption);
        MessageRoute.configRoutes(Index.router);
        Index.app.use('/', Index.router);
        Index.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
        // Index.app.use("*", (req, res) => {
        //     res.status(404).json({error: "Not Found"});
        // });
    }

    static async initDatabase() {
        const client = new mongodb.MongoClient(process.env.DB_URI);
        const port = process.env.PORT || 3030;
        try {
            await client.connect();
            console.log("Connected to db");
            await MessageDAO.connectDB(client);
            console.log("Référence créée avec succès");
            // console.log("MoviesDAO.movies: ", MoviesDAO.movies);
            Index.app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        } catch (error) {
            console.log("Error db connection: ", error);
            process.exit(1);
        }
    }

    static main() {
        dotenv.config();
        Index.createServer();
        Index.initDatabase().then(r => console.log("salut"));
    }
}

Index.main();