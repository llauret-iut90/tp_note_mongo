const messageController = require('../controllers/MessageController');

class MessageRoute {
    static configRoutes(router) {
        /**
         * @swagger
         * /message:
         *   post:
         *     summary: Insert a new message into the MongoDB collection
         *     parameters:
         *       - in: body
         *         name: message
         *         required: true
         *         schema:
         *           type: object
         *           properties:
         *             username:
         *               type: string
         *             message:
         *               type: string
         *             date:
         *               type: string
         *     responses:
         *       200:
         *         description: The message was successfully inserted
         */
        router.post('/message', messageController.apiAddMessage);

        /**
         * @swagger
         * /message/users:
         *   get:
         *     summary: Get all distinct users who participated in the conversations
         *     responses:
         *       200:
         *         description: A list of users
         */
        router.get('/message/users', messageController.apiGetUsersWithAtLeastOneMessage);

        /**
         * @swagger
         * /message/time:
         *   get:
         *     summary: Get all conversations before a specific date
         *     parameters:
         *       - in: query
         *         name: date
         *         required: true
         *         schema:
         *           type: string
         *           format: date
         *     responses:
         *       200:
         *         description: A list of conversations
         */
        router.get('/message/time', messageController.apiGetMessagesBeforeDate);

        /**
         * @swagger
         * /message/pattern:
         *   get:
         *     summary: Get all chat messages containing message similar to a given input
         *     parameters:
         *       - in: query
         *         name: message
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: A list of messages
         */
        router.get('/message/pattern', messageController.apiGetMessageWithPattern);

        /**
         * @swagger
         * /message:
         *   delete:
         *     summary: Delete the chat history of a specific user
         *     parameters:
         *       - in: query
         *         name: username
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: The chat history was successfully deleted
         */
        router.delete('/message', messageController.apiDeleteMessagesFromUser);


        /**
         * @swagger
         * /message/all:
         *   delete:
         *     summary: Delete all messages from the MongoDB collection
         *     responses:
         *       200:
         *         description: All messages were successfully deleted
         */

        router.delete('/message/all', messageController.apiDeleteAllMessages);

        /**
         * @swagger
         * /message/users/date:
         *   get:
         *     summary: Get all conversations between a date range for a specific user
         *     parameters:
         *       - in: query
         *         name: username
         *         required: true
         *         schema:
         *           type: string
         *       - in: query
         *         name: firstDate
         *         required: true
         *         schema:
         *           type: string
         *           format: date
         *       - in: query
         *         name: lastDate
         *         required: true
         *         schema:
         *           type: string
         *           format: date
         *     responses:
         *       200:
         *         description: A list of conversations
         */
        router.get('/message/users/date', messageController.apiGetMessagesFromUserBetweenDates);

        return router;
    }
}

module.exports = MessageRoute;