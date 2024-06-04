class MessageDAO {
    static messages;

    static async connectDB(conn) {
        if (MessageDAO.messages) {
            return;
        }
        try {
            MessageDAO.messages = await conn
                .db(process.env.DB_NAME)
                .collection("messages");
        } catch (e) {
            console.error(`Unable to establish collection handles in userDAO: ${e}`);
        }
    }

    static async addMessage(message) {
        try {
            return await MessageDAO.messages.insertOne(message);
        } catch (e) {
            console.error(`Unable to add message: ${e}`);
            return {error: e};
        }
    }

    static async getUsersWithAtLeastOneMessage() {
        try {
            return await MessageDAO.messages.distinct("username");
        } catch (e) {
            console.error(`Unable to get users with at least one message: ${e}`);
            return {error: e};
        }
    }

    static async getMessagesBeforeDate({date}) {
        try {
            return await MessageDAO.messages.find({date: {$lt: new Date(date).toISOString()}}).toArray();
        } catch (e) {
            console.error(`Unable to get messages between dates: ${e}`);
            return {error: e};
        }
    }

    static async getMessagesFromUserBetweenDates({username, firstDate, lastDate}) {
        try {
            return await MessageDAO.messages.find({
                username,
                date: {$lt: new Date(lastDate).toISOString(), $gt: new Date(firstDate).toISOString()}
            }).toArray();
        } catch (e) {
            console.error(`Unable to get messages from user between dates: ${e}`);
            return {error: e};
        }
    }

    static async getMessageWithPattern({pattern = ''}) {
        try {
            return await MessageDAO.messages.find({message: {$regex: pattern}}).toArray();
        } catch (e) {
            console.error(`Unable to get messages with pattern: ${e}`);
            return {error: e};
        }
    }

    static async deleteAllMessages() {
        try {
            return await MessageDAO.messages.deleteMany({});
        } catch (e) {
            console.error(`Unable to delete all messages: ${e}`);
            return {error: e};
        }
    }

    static async deleteMessagesFromUser({username}) {
        try {
            return await MessageDAO.messages.deleteMany({username});
        } catch (e) {
            console.error(`Unable to delete messages from user: ${e}`);
            return {error: e};
        }
    }
}

module.exports = MessageDAO