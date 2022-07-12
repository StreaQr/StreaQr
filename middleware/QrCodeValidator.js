import connectToDb from "../lib/db"
import WaitersSchedules from "../lib/models/WaitersSchedules"
import moment from "moment"
import rateLimit from "../lib/helpers/rate-limiter"

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 10000, // Max 10000 users per second
})

const withProtect = (handler) => {
    return async (req, res) => {
        try {
            await limiter.check(res, 4, 'CACHE_TOKEN')

            const reqAuth = req.headers["x-auth-token"];

            if (reqAuth !== process.env.X_AUTH_TOKEN) {
                return res.status(401).json({ errorMessage: "Unauthorized" });
            }
            try {
                const { method } = req;
                if (method !== "POST") {
                    return res.status(401).json({ errorMessage: "Only POST is allowed", });
                }
                //  const reqAuth = req.headers["x-auth-token"];
                //  if (reqAuth !== process.env.X_AUTH_TOKEN)
                //   return res.status(401).json({ errorMessage: "Unauthorized" });

                const QrCodeData = req.cookies.Code;

                const { RestaurantName, action } = req.body

                if ((action == undefined) || (typeof (action) != "string")) {
                    return res.status(400).json({ errorMessage: "invalid request" });
                }

                const actionsList = ["order", "callWaiter", "Receipt", "Rating", "DownloadReceipt", "orderOnline"]
                if (actionsList.indexOf(action) == -1) {
                    return res.status(400).json({ errorMessage: "action doesn't exist" })
                }

                if ((RestaurantName == undefined) || (typeof (RestaurantName) != "string"))
                    return res.status(400).json({ errorMessage: "Invalid Request" })

                if ((!QrCodeData) || (typeof (QrCodeData) != "string") || (QrCodeData == "")) {
                    return res.status(400).json({ errorMessage: "invalid request" });
                }
                const splitQrCode = QrCodeData.split("_")

                if (splitQrCode.length != 3) {
                    res.setHeader("Set-Cookie", `Code="201";path=/; HttpOnly; sameSite=strict;`)
                    return res.status(400).json({ errorMessage: "Invalid Request" })
                }
                const Table = splitQrCode[0]
                const Branch = splitQrCode[1]
                const accessCode = splitQrCode[2]

                await connectToDb()
                const WaitersSchedulesTable = await WaitersSchedules.findOne({ RestaurantName })
                let Subscription = false
                const date = new Date()
                if ((WaitersSchedulesTable.Subscription.status == "Premium") && (WaitersSchedulesTable.Subscription.expire > date))
                    Subscription = true

                if (Subscription == false)
                    return res.status(400).json({ errorMessage: "feature not available on free accounts" })

                if (!WaitersSchedulesTable) {
                    res.setHeader("Set-Cookie", `Code="201";path=/; HttpOnly; sameSite=strict;`)
                    return res.status(400).json({ errorMessage: "Restaurant not found" })
                }

                if ((WaitersSchedulesTable.RegenCodes == undefined) || (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`] == undefined) || (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`] == undefined)) {
                    res.setHeader("Set-Cookie", `Code="201";path=/; HttpOnly; sameSite=strict;`)
                    return res.status(400).json({ errorMessage: "Invalid QrCode please ask the waiter to generate a new code" })
                }

                if ((WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Code !== accessCode)) {
                    res.setHeader("Set-Cookie", `Code="201";path=/; HttpOnly; sameSite=strict;`)
                    return res.status(400).json({ errorMessage: "Invalid QrCode please ask the waiter to generate a new code" })
                } else {
                    let expired = false
                    if (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Date != undefined) {
                        const qrCodeDate = WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Date
                        const currentdate = new Date()
                        if (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Duration == undefined) {
                            currentdate.setHours(currentdate.getHours() - 1)
                        }
                        else {
                            const Duration = WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Duration
                            if (Duration == 30)
                                currentdate.setMinutes(currentdate.getMinutes() - Duration)
                            else
                                currentdate.setHours(currentdate.getHours() - Duration)
                        }
                        if (currentdate > qrCodeDate) {
                            expired = true
                        }

                    }

                    if (expired) {
                        return res.status(400).json({ errorMessage: "QrCode expired please ask the waiter to generate a new code" })
                    } else {
                        if (action == "Rating") {
                            const { Rating, userName, feedBack } = req.body
                            if ((!Rating) || (typeof (Rating) != "number") || (!userName) || (typeof (userName) != "string") || (feedBack == undefined) || (typeof (feedBack) != "string")) {
                                console.log("HERE")
                                return res.status(400).json({ errorMessage: "invalid request" })
                            }
                            else
                                if ((WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Rating != undefined) && (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Rating == true))
                                    return res.status(400).json({ errorMessage: "You already submitted your ratings" })
                        }
                        if (action == "DownloadReceipt") {
                            req.Code = accessCode
                            req.Branch = Branch
                            return handler(req, res);
                        } else {
                            let Waiters = []
                            const today = moment().format("ddd")
                            const format = 'HH:mm',
                                currentHour = moment().format(format),
                                time = moment(currentHour, format)

                            if ((WaitersSchedulesTable.Waiters != undefined) && (WaitersSchedulesTable.Waiters[`Branch ${Branch}`] != undefined) && (WaitersSchedulesTable.Waiters[`Branch ${Branch}`] != undefined)) {
                                for (let waiter of WaitersSchedulesTable.Waiters[`Branch ${Branch}`]) {
                                    if ((waiter.Schedule != undefined) && (waiter.Schedule[today] != undefined) && (waiter.PushToken != undefined)) {
                                        for (let ShiftHours of waiter.Schedule[today]) {
                                            const endAndStartTime = ShiftHours.split(","),
                                                beforeTime = moment(endAndStartTime[0], format),
                                                afterTime = moment(endAndStartTime[1], format);

                                            let onShift = false
                                            if (time.isBetween(beforeTime, afterTime)) {
                                                onShift = true
                                                if ((waiter.status != undefined) && (!waiter.status.onShift)) {
                                                    const dateInfo = waiter.status.date.split('-')
                                                    console.log(dateInfo)
                                                    const date = new Date()
                                                    if (dateInfo[0] == date.getDate()) {
                                                        const day = dateInfo[1].slice(0, 3)
                                                        const time = dateInfo[1].slice(4, 15)
                                                        if ((day == today) && (time == ShiftHours)) {
                                                            onShift = false
                                                        }
                                                    }
                                                }

                                                if (onShift)
                                                    Waiters.push(waiter)


                                            }
                                        }
                                    }
                                }
                            }
                            if (Waiters.length < 1) {
                                return res.status(400).json({ errorMessage: "No waiters available" })
                            } else {

                                const date = new Date()
                                const todayDate = date.getDate()
                                let changed = false

                                let leastAssignedWaiter = { "Index": 10000, "amount": 10000 }
                                let assignedWaiter = false



                                for (let i2 = 0; i2 < Waiters.length; i2++) {
                                    if (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Assigned != undefined) {
                                        if (Waiters[i2].ID == WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Assigned) {
                                            assignedWaiter = Waiters[i2]
                                            break
                                        }
                                    }
                                    if (Waiters[i2].Assigned != undefined) {
                                        for (let i3 = 0; i3 < Waiters[i2].Assigned.length; i3++) {
                                            if ((Waiters[i2].Assigned[i3] == `Table ${Table}`) && (Waiters[i2].Assigned[0] == todayDate)) {
                                                assignedWaiter = Waiters[i2]
                                                break
                                            } else if (Waiters[i2].Assigned[0] != todayDate) {
                                                changed = true
                                                Waiters[i2].Assigned = [todayDate, `Table ${Table}`]
                                                break
                                            }
                                        }
                                    }
                                }

                                if (!assignedWaiter) {
                                    for (let index = 0; index < Waiters.length; index++) {
                                        if (Waiters[index].Assigned == undefined) {
                                            changed = true
                                            Waiters[index].Assigned = [todayDate, `Table ${Table}`]
                                            break
                                        } else {
                                            if (Waiters[index].Assigned.length < leastAssignedWaiter.amount) {
                                                if (Waiters[index].Assigned[0] == todayDate) {
                                                    leastAssignedWaiter.amount = Waiters[index].Assigned.length
                                                    leastAssignedWaiter.Index = index
                                                } else {
                                                    changed = true
                                                    Waiters[index].Assigned = [todayDate, `Table ${Table}`]
                                                    break
                                                }
                                            }
                                        }
                                    }

                                    assignedWaiter = Waiters[0]

                                    if (leastAssignedWaiter.Index != 10000) {
                                        if (Waiters[leastAssignedWaiter.Index].Assigned.indexOf(`Table ${Table}`) == -1) {
                                            changed = true
                                            Waiters[leastAssignedWaiter.Index].Assigned.push(`Table ${Table}`)
                                            assignedWaiter = Waiters[leastAssignedWaiter.Index]
                                        }
                                    }
                                }



                                let toSave = false
                                if (action == "Rating") {
                                    WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Rating = true
                                    WaitersSchedulesTable.markModified('RegenCodes');
                                    toSave = true
                                }
                                if (changed) {
                                    for (let i = 0; i < WaitersSchedulesTable.Waiters[`Branch ${Branch}`].length; i++) {
                                        if (WaitersSchedulesTable.Waiters[`Branch ${Branch}`][i].ID == assignedWaiter.ID)
                                            WaitersSchedulesTable.Waiters[`Branch ${Branch}`][i] = assignedWaiter
                                    }
                                    WaitersSchedulesTable.markModified('Waiters');
                                    toSave = true
                                }
                                if (WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Status == "Waiting") {
                                    WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Status = "Activated"
                                    WaitersSchedulesTable.RegenCodes[`Branch ${Branch}`][`Table ${Table}`].Date = date
                                    WaitersSchedulesTable.markModified('RegenCodes');
                                    toSave = true
                                }

                                if (toSave) {
                                    const saveData = await WaitersSchedulesTable.save()
                                    if (saveData.RestaurantID) {
                                        req.Waiter = assignedWaiter
                                        req.Table = Table
                                        req.Code = accessCode
                                        return handler(req, res);
                                    } else {
                                        throw e
                                    }
                                } else {
                                    req.Waiter = assignedWaiter
                                    req.Table = Table
                                    req.Code = accessCode
                                    return handler(req, res);
                                }
                            }
                        }
                    }
                }

            } catch (error) {
                console.log(error)
                return res.status(401).json({
                    errorMessage: 'Invalid Qr Code',
                });
            }
        }
        catch {
            return res.status(400).json({ errorMessage: "To many requests" });
        }
    };

};

export default withProtect;


