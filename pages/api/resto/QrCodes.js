import auth from "../../../middleware/auth"
import rateLimit from "../../../lib/helpers/rate-limiter"
import Resto from '../../../lib/models/RestoModel';
import connectToDb from "../../../lib/db"

const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})
const handler = async (req, res) => {
    try {
        await limiter.check(res, 8, 'CACHE_TOKEN')
        try {
            const { method } = req;
            if (method !== "POST") {
                return res.status(401).json({ errorMessage: "Only POST is allowed", });
            } 
            const reqAuth = req.headers["x-auth-token"];
            if (reqAuth !== process.env.X_AUTH_TOKEN)
                return res.status(401).json({ errorMessage: "Unauthorized" });
            const Subscription = req.Subscription
            if (Subscription == false)
                return res.status(400).json({ errorMessage: "Not available for non premium accounts" });
            const { data } = req.body

            if ((data == undefined) || (typeof (data) !== "object"))
                return res.status(401).json({ errorMessage: "Invalid Data Structure" });

            if ((data["Branch 1"] == undefined) || (typeof (data["Branch 1"]) != "number")) {
                return res.status(401).json({ errorMessage: "Invalid Data Structure" });
            }

            const _id = req.user
            await connectToDb()
            const existingUser = await Resto.findOne({ _id });


            for (let items in data) {
                let tempvalue = data[items]
                data[items] = { "Tables": tempvalue }
            }

            existingUser.RestoData.RestoBranches = data
            const saveData = await existingUser.save();

            if (saveData.Email) {
                res.send('w')
            } else {
                return res.status(500).json({ errorMessage: "Something went Wrong" });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ errorMessage: "Something went Wrong" });
        }
    }
    catch {
        return res.status(400).json({ errorMessage: "Rate limit exceeded try again later" });
    }
}
export default auth(handler);

