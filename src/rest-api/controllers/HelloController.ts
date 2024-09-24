
export default class HelloController {
    hello = async (req, res, next) => {
        return res.status(200).json({
            message: 'Hello.'
        })
    }
}