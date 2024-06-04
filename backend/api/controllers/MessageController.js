const Message = require('../../dao/MessageDAO');
// const csrf = require('csurf')
// const csrfProtection = csrf({cookie: true})

class MessageController {
    static async apiAddMessage(req, res) {
        try {
            // // Validate the CSRF token
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }
            const message = req.body;
            const response = await Message.addMessage(message);
            res.json(response);
            // });
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiGetUsersWithAtLeastOneMessage(req, res) {
        try {
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }

            const response = await Message.getUsersWithAtLeastOneMessage();
            res.json(response);
            // });
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiGetMessagesBeforeDate(req, res) {
        try {
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }
            const {date} = req.query;
            const response = await Message.getMessagesBeforeDate({date});
            res.json(response);
            // });
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiGetMessagesFromUserBetweenDates(req, res) {
        try {
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }
            const {username, firstDate, lastDate} = req.query;
            const response = await Message.getMessagesFromUserBetweenDates({username, firstDate, lastDate});
            res.json(response);
            // })
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiGetMessageWithPattern(req, res) {
        try {
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }
            const {pattern} = req.query;
            const response = await Message.getMessageWithPattern({pattern});
            res.json(response);
            // })
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiDeleteAllMessages(req, res) {
        try {
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }
            const response = await Message.deleteAllMessages();
            res.json(response);
            // })
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiDeleteMessagesFromUser(req, res) {
        try {
            // csrfProtection(req, res, async function (err) {
            //     if (err) {
            //         res.status(403).json({error: 'Invalid CSRF token'});
            //         return;
            //     }
            const {username} = req.query;
            const response = await Message.deleteMessagesFromUser({username});
            res.json(response);
            // })
        } catch (e) {
            console.error(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }
}

module.exports = MessageController