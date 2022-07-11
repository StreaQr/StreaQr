import auth from "../../../middleware/auth"
import connectToDb from "../../../lib/db"
import WaitersSchedules from "../../../lib/models/WaitersSchedules";
import Resto from '../../../lib/models/RestoModel';
import rateLimit from "../../../lib/helpers/rate-limiter"
const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 10000, // Max 10000 users per second
})

const handler = async (req, res) => {
    try {
        await limiter.check(res, 20, 'CACHE_TOKEN')
        try {
            const { method } = req;
            if ((method !== "POST")) {
                return res.status(401).json({ errorMessage: "Only POST is allowed", });
            }
            const reqAuth = req.headers["x-auth-token"];
            if (reqAuth !== process.env.X_AUTH_TOKEN)
                return res.status(401).json({ errorMessage: "Unauthorized" });

            const Subscription = req.Subscription
            if (Subscription == false)
                return res.status(400).json({ errorMessage: "Not available for non premium accounts" });

            const { action } = req.body

            if ((action == undefined) || (typeof (action) != "string"))
                return res.status(401).json({ errorMessage: "Invalid Request" })

            const _id = req.user
            const RestaurantID = _id


            if (action == "GET") {  // Get all qrcodes route
                await connectToDb()
                const existingQrTable = await WaitersSchedules.findOne({ RestaurantID })
                if ((existingQrTable != undefined) && (existingQrTable.RegenCodes != undefined)) {
                    res.send(existingQrTable.RegenCodes)
                } else {
                    return res.status(404).json({ errorMessage: "No Table found" })
                }

            } else if (action == "POST") {   // generate a new qrcode

                const { data } = req.body
                if ((data == undefined) || (typeof (data) != "object"))
                    return res.status(401).json({ errorMessage: "Invalid data format" })


                if ((data.Branch == undefined) || (typeof (data.Branch) != "number") || (data.Table == undefined) || (typeof (data.Table) != "number"))
                    return res.status(401).json({ errorMessage: "Invalid data format" })



                await connectToDb()
                const existingQrTable = await WaitersSchedules.findOne({ RestaurantID });
                const code = Math.floor(Math.random() * (1000000 - 0) + 0)
                const Code = code.toString();

                const { duration } = req.body

                if ((existingQrTable != undefined)) {

                    if (existingQrTable.RegenCodes == undefined)
                        existingQrTable.RegenCodes = {}

                    if (existingQrTable.RegenCodes[`Branch ${data.Branch}`] == undefined)
                        existingQrTable.RegenCodes[`Branch ${data.Branch}`] = {}
                    let body = { Code, "Status": "Waiting" }
                    if ((duration != undefined) && (typeof (duration) == "number"))
                        body.Duration = duration

                    existingQrTable.RegenCodes[`Branch ${data.Branch}`][`Table ${data.Table}`] = body
                    existingQrTable.markModified('RegenCodes')

                    let changed = false
                    const date = new Date()
                    const todayDate = date.getDate()
                    if ((existingQrTable.Waiters != undefined) && (existingQrTable.Waiters[`Branch ${data.Branch}`] != undefined)) {

                        for (let i = 0; i < existingQrTable.Waiters[`Branch ${data.Branch}`].length; i++) {
                            if (existingQrTable.Waiters[`Branch ${data.Branch}`][i].Assigned != undefined) {
                                if (existingQrTable.Waiters[`Branch ${data.Branch}`][i].Assigned[0] == todayDate) {
                                    const index = existingQrTable.Waiters[`Branch ${data.Branch}`][i].Assigned.indexOf(`Table ${data.Table}`)
                                    if (index != -1) {
                                        existingQrTable.Waiters[`Branch ${data.Branch}`][i].Assigned.splice(index, 1)
                                        changed = true
                                    }
                                }
                            }
                        }
                    }
                    if (changed) {
                        existingQrTable.markModified('Waiters')
                    }

                    const randomNumber = Math.floor(Math.random() * 3) + 1
                    const currentdate = new Date()
                    if (randomNumber == 1) {
                        const branchsArray = Object.keys(existingQrTable.RegenCodes)
                        for (let branchs of branchsArray) {
                            let tables = existingQrTable.RegenCodes[branchs]
                            for (let index2 = 0; index2 < tables.length; index2++) {
                                if (existingQrTable.RegenCodes[branchs][tables[index2]].Status == "Activated") {
                                    const qrCodeDate = existingQrTable.RegenCodes[branchs][tables[index2]].Date
                                    if (existingQrTable.RegenCodes[branchs][tables[index2]].Duration == undefined) {
                                        currentdate.setHours(currentdate.getHours() - 1)
                                    }
                                    else {
                                        const Duration = existingQrTable.RegenCodes[branchs][tables[index2]].Duration
                                        if (Duration == 30)
                                            currentdate.setMinutes(currentdate.getMinutes() - Duration)
                                        else
                                            currentdate.setHours(currentdate.getHours() - Duration)
                                    }
                                    if (currentdate > qrCodeDate) {
                                        delete existingQrTable.RegenCodes[branchs][tables[index2]]
                                    }
                                }

                            }
                        }
                    }

                    const saveData = await existingQrTable.save();

                    if (saveData.RegenCodes) {
                        res.send(Code)
                    } else {
                        return res.status(500).json({ errorMessage: "Something went Wrong" });
                    }

                } else {

                    let RegenCodes = {}
                    RegenCodes[`Branch ${data.Branch}`] = {}
                    let body = { Code, "Status": "Waiting" }
                    if ((duration != undefined) && (typeof (duration) == "number"))
                        body.Duration = duration
                    RegenCodes[`Branch ${data.Branch}`][`Table ${data.Table}`] = body

                    const _id = RestaurantID
                    const existingUser = await Resto.findOne({ _id });

                    if ((existingUser != undefined) || (existingUser.RestaurantName != undefined)) {
                        const newTable = new WaitersSchedules({
                            RestaurantID,
                            RestaurantName: existingUser.RestaurantName,
                            RegenCodes
                        });
                        const saveData = await newTable.save();    // save a new user account to the db
                        if (saveData.RegenCodes) {
                            res.send(Code)
                        } else {
                            return res.status(500).json({ errorMessage: "Something went Wrong" });
                        }
                    } else {
                        res.status(500).json({ errorMessage: "Something went wrong" })
                    }

                }

            } else {
                return res.status(401).json({ errorMessage: "Invalid Request" })
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

