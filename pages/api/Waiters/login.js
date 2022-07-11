import rateLimit from "../../../lib/helpers/rate-limiter"
import bcrypt from "bcrypt"
import WaiterTable from "../../../lib/models/WaiterModel"
import GetCookie from "../../../lib/helpers/cookie"
import WaitersSchedules from "../../../lib/models/WaitersSchedules"
import connectToDb from "../../../lib/db"
const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})
export default async function Login(req, res) {

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

            const { RestaurantName, password, Email, uniqueID, PushToken } = req.body;

            if ((RestaurantName == undefined) || (password == undefined) || (Email == undefined) || (uniqueID == undefined) || (PushToken == undefined))
                return res.status(400).json({ errorMessage: "Invalid Request" })

            if ((typeof (RestaurantName) != "string") || (typeof (password) != "string") || (typeof (Email) != "string") || (typeof (uniqueID) != "string") || (typeof (PushToken) != "string"))
                return res.status(400).json({ errorMessage: "Invalid Request" })

            await connectToDb();

            const existingUser = await WaiterTable.findOne({ RestaurantName, UserName: Email });

            if (!existingUser)
                return res.status(400).json({ errorMessage: "Wrong userName or password" });

            const passwordCorrect = await bcrypt.compare(
                password,
                existingUser.PasswordHash
            );

            if (!passwordCorrect) {
                return res.status(401).json({ errorMessage: "Wrong userName or password." });
            }

            let uniqueIDCorrect = null

            if (existingUser.uniqueID != undefined) {
                uniqueIDCorrect = await bcrypt.compare(
                    uniqueID,
                    existingUser.uniqueID
                );
            }

            if ((passwordCorrect) && ((uniqueIDCorrect) || (uniqueIDCorrect == null))) {

                const Cookie = GetCookie(existingUser._id, "Waiter")
                const date = new Date()

                let body = {
                    "Cookie": Cookie,
                    "RestaurantName": existingUser.RestaurantName,
                    "ServerTime": date,
                    "UserName": existingUser.UserName,
                    "Data": existingUser.Data
                }

                if (existingUser.Notifications != undefined) {
                    body.Notifications = existingUser.Notifications
                }


                let userUpdated = false
                if ((existingUser.PushToken == undefined) || (existingUser.PushToken != PushToken)) {
                    existingUser.PushToken = PushToken
                    userUpdated = true
                }
                if (uniqueIDCorrect == null) {
                    const salt = await bcrypt.genSalt();
                    const uniqueIDHash = await bcrypt.hash(uniqueID, salt);

                    existingUser.uniqueID = uniqueIDHash
                    const saveData = await existingUser.save();
                    if (saveData.UserName) {
                        const WaitersSchedulesTable = await WaitersSchedules.findOne({ RestaurantName: existingUser.RestaurantName })
                        const branchsArray = Object.keys(WaitersSchedulesTable.Waiters)
                        for (let branchs of branchsArray) {
                            for (let i = 0; i < WaitersSchedulesTable.Waiters[branchs].length; i++) {
                                if (JSON.stringify(WaitersSchedulesTable.Waiters[branchs][i].ID) == JSON.stringify(existingUser._id)) {
                                    if ((WaitersSchedulesTable.Waiters[branchs][i].PushToken == undefined) || (WaitersSchedulesTable.Waiters[branchs][i].PushToken != PushToken)) {
                                        WaitersSchedulesTable.Waiters[branchs][i].PushToken = PushToken
                                    }
                                }
                            }
                        }
                        WaitersSchedulesTable.markModified('Waiters');
                        const saveMainRestoTable = await WaitersSchedulesTable.save()
                        if (saveMainRestoTable.RestaurantName)
                            res.send(body)
                    }

                } else {
                    if (userUpdated) {
                        const saveData = await existingUser.save();
                        if (saveData.UserName) {
                            const WaitersSchedulesTable = await WaitersSchedules.findOne({ RestaurantName: existingUser.RestaurantName })
                            const branchsArray = Object.keys(WaitersSchedulesTable.Waiters)
                            for (let branchs of branchsArray) {
                                for (let i = 0; i < WaitersSchedulesTable.Waiters[branchs].length; i++) {
                                    if (JSON.stringify(WaitersSchedulesTable.Waiters[branchs][i].ID) == JSON.stringify(existingUser._id)) {
                                        if ((WaitersSchedulesTable.Waiters[branchs][i].PushToken == undefined) || (WaitersSchedulesTable.Waiters[branchs][i].PushToken != PushToken)) {
                                            WaitersSchedulesTable.Waiters[branchs][i].PushToken = PushToken
                                        }
                                    }
                                }
                            }

                            WaitersSchedulesTable.markModified('Waiters');
                            const saveMainRestoTable = await WaitersSchedulesTable.save()

                            if (saveMainRestoTable.RestaurantName)
                                res.send(body)
                        }
                    } else
                        res.send(body);
                }
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
