import MiddlewareSingleton from '../helpers/middleware';

async function pingPost(req, res) {
    try {
        let data = { message : 'Ping with Succcess'}
        MiddlewareSingleton.respond(res, req, data);
    } catch (error) {
        MiddlewareSingleton.respondError(res, error);
    }
}

export {
    pingPost
};