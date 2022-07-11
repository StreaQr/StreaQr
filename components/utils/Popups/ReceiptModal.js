import { useState } from "react"
import PropTypes from 'prop-types';
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im"
import styles from "./Button.module.css"
import axios from "axios"
import SpinnerLoader from "./SpinnerLoader";
let initialized = false
const ReceiptModal = ({ handleCancel, RestaurantName, Data }) => {
    const [ReceiptTypeSelection, setReceiptTypeSelection] = useState({ "DigitalReceipt": false, "PaperReceipt": false })
    const [spinner, setSpinner] = useState(false)

    if (ReceiptTypeSelection.DigitalReceipt)
        if (!initialized) {
            OneSignal.push(function () {
                OneSignal.SERVICE_WORKER_PARAM = { scope: '/push/' };
                OneSignal.SERVICE_WORKER_PATH = 'push/OneSignalSDKWorker.js'
                OneSignal.SERVICE_WORKER_UPDATER_PATH = 'push/OneSignalSDKUpdaterWorker.js'
                OneSignal.init({
                    appId: "de8b73bb-9a99-4de7-8f35-978357e96221",
                    notifyButton: {
                        enable: true,
                        prenotify: true
                    },
                    allowLocalhostAsSecureOrigin: true,
                    promptOptions: {
                        customlink: {
                            enabled: true, /* Required to use the Custom Link */
                            style: "button", /* Has value of 'button' or 'link' */
                            size: "small", /* One of 'small', 'medium', or 'large' */
                            color: {
                                button: '#E12D30', /* Color of the button background if style = "button" */
                                text: '#FFFFFF', /* Color of the prompt's text */
                            },
                            text: {
                                subscribe: `get notified when your bill is ready`, /* Prompt's text when not subscribed */
                                unsubscribe: "Unsubscribe", /* Prompt's text when subscribed */
                            },
                            unsubscribeEnabled: true, /* Controls whether the prompt is visible after subscription */
                        }
                    }
                });
                OneSignal.setDefaultNotificationUrl(`https://StreaQr.com/resto/${RestaurantName}/commands`);
            })
            initialized = true
        }

    async function submit() {
        OneSignal.push(function () {
            OneSignal.isPushNotificationsEnabled(function (isEnabled) {
                if (isEnabled)
                    OneSignal.getUserId(function (userId) {
                        console.log("OneSignal User ID:", userId);
                        sendRequest(userId)
                    });
                else
                    sendRequest()
            });

        });
        async function sendRequest(id) {
            try {
                setSpinner(true)
                const config = {
                    headers: { 'X-Auth-Token': process.env.X_AUTH_TOKEN }
                };

                let body = {
                    RestaurantName,
                    action: "Receipt",
                    ReceiptType: ReceiptTypeSelection
                }

                if (id != undefined)
                    body.NotificationID = id

                const req = await axios.post("/api/users/get", body, config);
                const clientSecret = await req.data;

                if (clientSecret == "w") {
                    setSpinner(false)
                    handleCancel("Success")
                }

            } catch (error) {
                setSpinner(false)
                if (error.response.data.errorMessage) {
                    handleCancel(error.response.data.errorMessage)
                } else
                    handleCancel("Something went wrong")

            }
        }
    }

    return (
        <>
            <div onClick={() => handleCancel()} className={styles.backGround}></div>
            <section className={styles.popupBackground}>
                {(!spinner) ?
                    <div className={styles.popupCard} style={{ height: "230px" }}>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <p className={styles.cardTitle}>Receipt Type</p>
                            <button onClick={() => handleCancel()} className={styles.escape} />
                        </div>
                        <div style={{ height: "40%", flexDirection: "column", display: "flex", opacity: (Data.ReceiptDigital) ? 1 : 0.5, justifyContent: "space-around" }}>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <p className={styles.cardOption}>Digital Receipt</p>
                                <button type="button" style={{ marginRight: "5px" }} disabled={!Data.ReceiptDigital} onClick={() => setReceiptTypeSelection({ "DigitalReceipt": !ReceiptTypeSelection.DigitalReceipt, "PaperReceipt": ReceiptTypeSelection.PaperReceipt })} className={styles.button} >
                                    {ReceiptTypeSelection.DigitalReceipt ? <ImCheckboxChecked color="#d8a761" /> : <ImCheckboxUnchecked color="#d8a761" />}

                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", marginBottom: 10, opacity: (Data.ReceiptPaper) ? 1 : 0.5, }}>
                                <p className={styles.cardOption}>Paper Receipt</p>
                                <button type="button" style={{ marginRight: "5px" }} disabled={!Data.ReceiptPaper} onClick={() => setReceiptTypeSelection({ "PaperReceipt": !ReceiptTypeSelection.PaperReceipt, "DigitalReceipt": ReceiptTypeSelection.DigitalReceipt })} className={styles.button}>
                                    {ReceiptTypeSelection.PaperReceipt ? <ImCheckboxChecked color="#d8a761" /> : <ImCheckboxUnchecked color="#d8a761" />}
                                </button>
                            </div>
                            {(initialized) ?
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <div style={{ minHeight: 50 }} className='onesignal-customlink-container'></div>
                                </div>
                                :
                                null
                            }
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                            <button onClick={() => handleCancel()} className={styles.popupCancelButton}>
                                <p className={styles.popupCancelButtonText}>Cancel</p>
                            </button>
                            <button onClick={() => submit()} className={styles.popupButton}>
                                <p className={styles.popupButtonText}>Confirm</p>
                            </button>
                        </div>
                    </div> :
                    <SpinnerLoader />
                }
            </section>
        </>
    )
}

ReceiptModal.propTypes = {
    handleCancel: PropTypes.func,
    Data: PropTypes.object,
    RestaurantName: PropTypes.string
}

export default ReceiptModal;