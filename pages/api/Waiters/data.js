import WaiterAuth from "../../../middleware/WaiterAuth"
import connectToDb from "../../../lib/db"
import WaiterTable from "../../../lib/models/WaiterModel"
import WaitersSchedules from "../../../lib/models/WaitersSchedules"
import Resto from "../../../lib/models/RestoModel"
import rateLimit from "../../../lib/helpers/rate-limiter"

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 10000, // Max 10000 users per second
})



const handler = async (req, res) => {

    try {
        await limiter.check(res, 4, 'CACHE_TOKEN')
        try {
            const { method } = req;
            if (method !== "POST") {
                return res.status(401).json({ errorMessage: "Only POST is allowed", });
            }
            const reqAuth = req.headers["x-auth-token"];
            if (reqAuth !== process.env.X_AUTH_TOKEN)
                return res.status(401).json({ errorMessage: "Unauthorized" });

            const { action } = req.body
            const _id = req.user
            if ((action != undefined) && (typeof (action) == "string") && ((action === "getNotifications") || (action == "getMenu") || (action === "clearAllNotifications") || (action === "dismisNotification"))) {
                if (action === "getMenu") {
                    const existingRestaurantTable = await Resto.findOne({ _id: req.RestaurantID })
                    if (existingRestaurantTable.OnlineMenu != undefined)
                        res.send(existingRestaurantTable.OnlineMenu.items)
                    else res.send({})

                } else if (action === "getNotifications") {
                    const existingWaiterTable = await WaiterTable.findOne({ _id })
                    if (!existingWaiterTable)
                        return res.status(400).json({ errorMessage: "User not found" })

                    if (existingWaiterTable.Notifications != undefined)
                        res.send(existingWaiterTable.Notifications)
                } else if (action === "clearAllNotifications") {
                    const existingWaiterTable = await WaiterTable.findOne({ _id })
                    if (!existingWaiterTable)
                        return res.status(400).json({ errorMessage: "User not found" })
                    if (existingWaiterTable.Notifications != undefined) {
                        existingWaiterTable.Notifications = []
                        const saveData = await existingWaiterTable.save()
                        if (saveData.RestaurantID) {
                            res.send("w")
                        }

                    } else {
                        res.send("w")
                    }
                } else {
                    const { Notification } = req.body
                    if ((Notification == undefined) || (typeof (Notification) != 'string'))
                        return res.status(400).json({ errorMessage: "Invalid Request" })

                    const existingWaiterTable = await WaiterTable.findOne({ _id })
                    if (!existingWaiterTable)
                        return res.status(400).json({ errorMessage: "User not found" })
                    if (existingWaiterTable.Notifications != undefined) {
                        const index = existingWaiterTable.Notifications.indexOf(Notification)
                        if (index != -1) {
                            existingWaiterTable.Notifications.splice(index, 1)
                            const saveData = await existingWaiterTable.save()

                            if (saveData.RestaurantID) {
                                res.send("w")
                            }
                        }
                    } else res.send('w')
                }
            } else {
                const { Schedule, shift, PushToken } = req.body
                if ((shift != undefined) && (typeof (shift) == "boolean")) {
                    const { FromTo } = req.body
                    if ((FromTo == undefined) && (typeof (FromTo) != 'string'))
                        return res.status(400).json({ errorMessage: "Invalid request" })


                    await connectToDb()
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",]
                    const date = new Date()

                    let today = days[date.getDay()];
                    today = today[0] + today[1] + today[2]


                    const existingWaiterTable = await WaiterTable.findOne({ _id })

                    if (!existingWaiterTable)
                        return res.status(400).json({ errorMessage: "User not found" })





                    existingWaiterTable.Data.schedule.status = { "onShift": shift, "date": `${date.getDate()}-${today}_${FromTo}` }
                    existingWaiterTable.markModified('Data');
                    const saveData = await existingWaiterTable.save()

                    if (saveData.RestaurantID) {
                        const WaitersSchedulesTable = await WaitersSchedules.findOne({ RestaurantName: existingWaiterTable.RestaurantName })

                        let Subscription = false
                        const date2 = new Date()
                        if ((WaitersSchedulesTable.Subscription.status == "Premium") && (WaitersSchedulesTable.Subscription.expire > date2))
                            Subscription = true

                        if (Subscription == false)
                            return res.status(400).json({ errorMessage: "feature not available on free accounts" })

                        const branchsArray = Object.keys(WaitersSchedulesTable.Waiters)

                        for (let branchs of branchsArray) {
                            for (let i = 0; i < WaitersSchedulesTable.Waiters[branchs].length; i++)
                                if (WaitersSchedulesTable.Waiters[branchs][i].ID == _id) {
                                    if (WaitersSchedulesTable.Waiters[branchs][i].Schedule == undefined)
                                        WaitersSchedulesTable.Waiters[branchs][i].Schedule = {}
                                    WaitersSchedulesTable.Waiters[branchs][i].status = { "onShift": shift, "date": `${date.getDate()}-${today}_${FromTo}` }

                                    WaitersSchedulesTable.markModified('Waiters');
                                    const saveMainRestoTable = await WaitersSchedulesTable.save()

                                    if (saveMainRestoTable.RestaurantName)
                                        res.send("w")
                                }
                        }
                    }
                } else {
                    if ((PushToken == undefined) || (typeof (PushToken) != "string"))
                        return res.status(400).json({ errorMessage: "Invalid request" })

                    if (((Schedule == undefined) || (typeof (Schedule) != "object")) && ((shift == undefined) || (typeof (shift) != "boolean")))
                        return res.status(400).json({ errorMessage: "Invalid request" })

                    const _id = req.user
                    await connectToDb()

                    const existingWaiterTable = await WaiterTable.findOne({ _id })

                    if (!existingWaiterTable)
                        return res.status(400).json({ errorMessage: "User not found" })

                    existingWaiterTable.Data.schedule = Schedule
                    existingWaiterTable.PushToken = PushToken
                    const saveData = await existingWaiterTable.save()

                    if (saveData.RestaurantID) {
                        const WaitersSchedulesTable = await WaitersSchedules.findOne({ RestaurantName: existingWaiterTable.RestaurantName })
                        const branchsArray = Object.keys(WaitersSchedulesTable.Waiters)
                        for (let branchs of branchsArray) {
                            for (let i = 0; i < WaitersSchedulesTable.Waiters[branchs].length; i++)
                                if (WaitersSchedulesTable.Waiters[branchs][i].ID == _id) {
                                    WaitersSchedulesTable.Waiters[branchs][i].Schedule = Schedule
                                    if ((WaitersSchedulesTable.Waiters[branchs][i].PushToken == undefined) || (WaitersSchedulesTable.Waiters[branchs][i].PushToken != PushToken))
                                        WaitersSchedulesTable.Waiters[branchs][i].PushToken = PushToken
                                }
                        }

                        WaitersSchedulesTable.markModified('Waiters');
                        const saveMainRestoTable = await WaitersSchedulesTable.save()

                        if (saveMainRestoTable.RestaurantName)
                            res.send("w")
                    }
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ errorMessage: "Something went Wrong" });
        }
    }
    catch {
        return res.status(400).json({ errorMessage: "To many requests" });
    }

}

export default WaiterAuth(handler);

