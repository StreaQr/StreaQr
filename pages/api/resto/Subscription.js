import auth from "../../../middleware/auth"
import connectToDb from "../../../lib/db"
import Resto from '../../../lib/models/RestoModel';
import rateLimit from "../../../lib/helpers/rate-limiter"
import ActivationCodes from "../../../lib/models/ActivationCodesTableModel"
import WaitersSchedules from "../../../lib/models/WaitersSchedules";
const limiter = rateLimit({
    interval: 120 * 1000, // 60 seconds
    uniqueTokenPerInterval: 10000, // Max 10000 users per second
})

const handler = async (req, res) => {
    try {
        await limiter.check(res, 4, 'CACHE_TOKEN')
        try {
            const { method } = req;
            if ((method !== "POST")) {
                return res.status(401).json({ errorMessage: "Only POST is allowed", });
            }
            const reqAuth = req.headers["x-auth-token"];
            if (reqAuth !== process.env.X_AUTH_TOKEN)
                return res.status(401).json({ errorMessage: "Unauthorized" });

            const _id = req.user

            const SubscriptionData = req.SubscriptionData
            const { action } = req.body
            if ((action == undefined) || (typeof (action) != "string"))
                return res.status(400).json({ errorMessage: "Invalid Request" })

            if (action == "ActivateTrial") {
                return res.status(400).json({ errorMessage: "Service disabled" })
                if ((SubscriptionData.trialUsed == false) && (SubscriptionData.status == "free")) {
                    //    await connectToDb()
                    //      const existingUser = await Resto.findOne({ _id })

                    /* const existingWaiterTable = await WaitersSchedules.findOne({ RestaurantID: _id })
                     if (!existingWaiterTable)
                         return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
                     existingUser.Subscription.trialUsed = true
                     existingUser.Subscription.status = "Premium"
                     existingWaiterTable.Subscription.trialUsed = true
                     existingWaiterTable.Subscription.status = "Premium"
                     const date = new Date()
                     date.setDate(date.getDate() + 14)
                     existingUser.Subscription.expire = date
                     existingUser.Subscription.expire = date
                     const saveData = await existingUser.save()
                     if (saveData.RestaurantName) {
                         const saveData2 = await existingWaiterTable.save()
                         if (saveData2.RestaurantID)
                             res.send("W")
                         else
                             return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
                     } else return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
 */
                }

            } else {
                const { ActivationCode } = req.body
                const Subscription = req.Subscription
                if ((ActivationCode == undefined) && (typeof (ActivationCode) != "string"))
                    return res.status(400).json({ errorMessage: "Invalid Request" })
                await connectToDb()
                const CodesTable = await ActivationCodes.findOne({ Title: "ActivationCodes" })
                if (!CodesTable)
                    return res.status(400).json({ errorMessage: "Invalid Activation Code" })

                if (CodesTable.Codes[`${ActivationCode}`] == undefined)
                    return res.status(400).json({ errorMessage: "Invalid Activation Code" })
                else {
                    const existingUser = await Resto.findOne({ _id })
                    const existingWaiterTable = await WaitersSchedules.findOne({ RestaurantID: _id })

                    existingUser.Subscription.trialUsed = true
                    existingUser.Subscription.status = "Premium"
                    if (existingWaiterTable) {
                        existingWaiterTable.Subscription.trialUsed = true
                        existingWaiterTable.Subscription.status = "Premium"
                    }

                    if (Subscription == false) {
                        const date = new Date()
                        console.log(CodesTable.Codes[`${ActivationCode}`])
                        date.setDate(date.getDate() + CodesTable.Codes[`${ActivationCode}`])
                        existingUser.Subscription.expire = date
                        if (existingWaiterTable)
                            existingWaiterTable.Subscription.expire = date
                    }
                    else {
                        const date2 = new Date(existingUser.Subscription.expire)
                        date2.setDate(date2.getDate() + CodesTable.Codes[`${ActivationCode}`])
                        existingUser.Subscription.expire = date2
                        if (existingWaiterTable)
                            existingWaiterTable.Subscription.expire = date2
                    }

                    const saveData = await existingUser.save()

                    if (saveData.RestaurantName) {
                        if (existingWaiterTable) {
                            const saveData2 = await existingWaiterTable.save()
                            if (saveData2.RestaurantID) {
                                const newObject = { ...CodesTable.Codes }
                                delete newObject[`${ActivationCode}`]
                                CodesTable.Codes = newObject
                                const saveData2 = await CodesTable.save()
                                CodesTable.markModified('Codes')
                                if (saveData2.Title)
                                    res.send("W")
                                else
                                    return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
                            }
                        }
                        else {

                            const date3 = new Date()
                            date3.setDate(date3.getDate() + CodesTable.Codes[`${ActivationCode}`])
                            const newWaitersSchedulesTable = new WaitersSchedules({
                                RestaurantID: _id,
                                RestaurantName: req.RestaurantName,
                                Subscription: {
                                    trialUsed: true,
                                    status: "Premium",
                                    expire: date3
                                }
                            })
                            const saveData2 = await newWaitersSchedulesTable.save();
                            if (saveData2.RestaurantID) {
                                const newObject = { ...CodesTable.Codes }
                                delete newObject[`${ActivationCode}`]
                                CodesTable.Codes = newObject
                                const saveData2 = await CodesTable.save()
                                CodesTable.markModified('Codes')
                                if (saveData2.Title)
                                    res.send("W")
                                else
                                    return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
                            } else
                                return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
                        }

                    } else return res.status(400).json({ errorMessage: "Something went wrong please contact support" })
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
export default auth(handler);

