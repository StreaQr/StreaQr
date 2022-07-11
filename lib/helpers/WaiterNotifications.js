import WaiterTable from "../models/WaiterModel"

export default async function WaiterNotifications(_id, notificationString) {
    try {
        const deleteNotifcationsAfter = 1 // 1 Hour

        const existingWaiterTable = await WaiterTable.findOne({ _id })
        if (!existingWaiterTable)
            return res.status(400).json({ errorMessage: "User not found" })

        if (existingWaiterTable.Notifications != undefined) {
            for (let i = 0; i < existingWaiterTable.Notifications.length; i++) {
                let messageSliced
                if (typeof (existingWaiterTable.Notifications[i]) == "string") {
                    messageSliced = existingWaiterTable.Notifications[i].split("_")
                } else
                    messageSliced = existingWaiterTable.Notifications[i].Message.split("_")
                const date = new Date(messageSliced[1])
                const currentDate = new Date()
                currentDate.setHours(currentDate.getHours() - deleteNotifcationsAfter)
                if (currentDate > date) {
                    existingWaiterTable.Notifications.splice(i, 1)
                }

            }

            existingWaiterTable.Notifications.push(notificationString)
        } else {
            existingWaiterTable.Notifications = [notificationString]
        }
        if (existingWaiterTable.Notifications.length > 30) {
            existingWaiterTable.Notifications.pop()
        }

        const saveData = await existingWaiterTable.save()
        return true

    } catch (e) {
        return false
    }



}
