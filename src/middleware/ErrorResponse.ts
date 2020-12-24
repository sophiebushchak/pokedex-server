/**
 * Express Middleware that is used as the final middleware in the line.
 * It takes an error and the regular middleware parameters.
 * Then it sends an error message response.
 * @param err
 * @param req
 * @param res
 * @param next
 */
const sendErrorResponse = (err, req, res, next) => {
    console.log("Handling an error.")
    console.log(err)
    console.log("Sending error response.")
    const status = err.statusCode || 500;
    const message = err.errorThrown.message || "Something went wrong.";
    res.status(status).json({statusCode: status, message: message})
}

export default sendErrorResponse
