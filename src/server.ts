import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';

/** Router Import */
import authorRoutes from './routes/Author';
import bookRoutes from './routes/Book';

/** Router Import */

const router = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Connected to MongoDB');
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to Connect to Database');
        Logging.error(error);
    });

/** Only start the server if connected to MongoDB */

const StartServer = () => {
    router.use((req, res, next) => {
        /** Log the incoming request */
        Logging.info(`Incomming -> method: [${req.method}] - Url: [${req.url}] - IP [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            Logging.info(`Incomming -> method: [${req.method}] - Url: [${req.url}] - IP [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    /** Routes */
    router.use('/v1/authors', authorRoutes);
    router.use('/v1/books', bookRoutes);

    /** Healtcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    /** Error Handling */
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}.`));
};
