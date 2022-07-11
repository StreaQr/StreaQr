import WaiterAuth from "../../../middleware/WaiterAuth"
import connectToDb from "../../../lib/db"
import ReceiptTable from "../../../lib/models/ReceiptsModel"
import WaiterTable from "../../../lib/models/WaiterModel"
import SendNotification from "../../../lib/helpers/sendNotification"
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

            const { Table, Guests, Orders, Code, Total, Notification, NotificationID } = req.body

            if ((Table == undefined) || (typeof (Table) != "string") || (Guests == undefined) || (typeof (Guests) != "string") || (Orders == undefined) || (typeof (Orders) != "object") ||
                (Code == undefined) || (typeof (Code) != "string") || (Total == undefined) || (typeof (Total) != "number") || (Notification == undefined) || (typeof (Notification) != "string"))
                return res.status(400).json({ errorMessage: "Invalid Request" });

            const RestaurantID = req.RestaurantID,
                WaiterName = req.WaiterName,
                date = new Date(),
                dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`,
                WaiterId = req.user

            //date
            await connectToDb()
            const existingReceiptTable = await ReceiptTable.findOne({ RestaurantID })

            if (!existingReceiptTable)
                return res.status(400).json({ errorMessage: "Please ask the restaurant owner to complete the receipt setup" })
            else {
                if (existingReceiptTable.Receipts != undefined) {
                    for (let keys in existingReceiptTable.Receipts) {
                        const oldReceiptTime = existingReceiptTable.Receipts[keys].date.split(" ")
                        const oldReceiptHours = oldReceiptTime[1].split(":")
                        let hours = parseInt(oldReceiptHours[0])
                        hours += 2
                        if (hours < date.getHours()) {
                            delete existingReceiptTable.Receipts[keys]
                        }

                    }
                } else existingReceiptTable.Receipts = {}

                existingReceiptTable.Receipts[`${Code}`] = { Table, Guests, Orders, Total, WaiterName, date: dateString }

                existingReceiptTable.markModified('Receipts')
                const saveData = await existingReceiptTable.save()
                if (saveData.RestaurantID) {

                    const existingWaiterTable = await WaiterTable.findOne({ _id: WaiterId });
                    if (existingWaiterTable.Notifications != undefined) {
                        const spliceNotification = Notification.split("_")
                        let index = existingWaiterTable.Notifications.indexOf(Notification)
                        if (spliceNotification[0] == "OrderOnline") {
                            for (let i = 0; i < existingWaiterTable.Notifications.length; i++) {
                                if (typeof (existingWaiterTable.Notifications[i]) == "object") {
                                    if (Notification == existingWaiterTable.Notifications[i].Message)
                                        index = i
                                }
                            }
                        }

                        if (index != -1) {
                            existingWaiterTable.Notifications.splice(index, 1)
                            const saveData2 = await existingWaiterTable.save()

                            if (saveData2.RestaurantID) {
                                if ((NotificationID != undefined) && (typeof (NotificationID) == "string")) {
                                    return new Promise((resolve, reject) => {
                                        SendNotification(NotificationID, function (err, data) {
                                            resolve()
                                            if (err)
                                                res.send("Couldn't send a notification for the customer")
                                            else if (data.recipients > 0)
                                                res.send("w")
                                            else
                                                res.send("Couldn't send a notification for the customer")
                                        });
                                    });

                                } else {
                                    res.send("w")
                                }
                            }
                        } res.send("w")
                    } else {

                        if ((NotificationID != undefined) && (typeof (NotificationID) == "string")) {
                            return new Promise((resolve, reject) => {
                                SendNotification(NotificationID, function (err, data) {
                                    resolve()
                                    if (err)
                                        res.send("Couldn't send a notification for the customer")
                                    else if (data.recipients > 0)
                                        res.send("w")
                                    else
                                        res.send("Couldn't send a notification for the customer")
                                });
                            });
                        } else res.send("w")
                    }
                }
                else
                    throw e
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

