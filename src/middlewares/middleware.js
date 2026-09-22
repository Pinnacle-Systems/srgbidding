import jwt from "jsonwebtoken";

const publicPaths = ['/users/login', '/users/sendOtp', '/users/verifyOtp'];

const middleware = {
    TokenAuthentication: (request, response, next) => {
        // Skip authentication for public routes, static file retrieval, or CORS preflight
        if (
            publicPaths.includes(request.path) ||
            request.path.startsWith('/retreiveFile') ||
            request.method === 'OPTIONS'
        ) {
            return next();
        }

        // console.log(request?.headers?.authorization, "request")

        try {
            //   get the token from the authorization header
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                return response.status(404).json({ error: "No token provided!" });
            }

            const token = authHeader.split(" ")[1];
            // console.log("token", token);

            //check if the token matches the supposed origin
            const decodedToken = jwt.verify(token, "RANDOM-TOKEN");

            // retrieve the user details of the logged in user
            const user = decodedToken;

            // console.log("user", decodedToken);

            // pass the user down to the endpoints here
            request.user = user;

            // pass down functionality to the endpoint
            next();

        } catch (error) {
            response.status(401).json({
                error: new Error("Invalid request!"),
            });
        }
    },
    RequestValidation: (schema, property) => {
        return (req, res, next) => {
            const { error } = validate(req[property], schema);
            const valid = error == null;
            if (valid) { next(); }
            else {
                const { details } = error;
                const message = details.map(i => i.message).join(',')
                console.log("error", message);
                res.status(422).json({ error: message })
            }
        }
    }
}
export default middleware