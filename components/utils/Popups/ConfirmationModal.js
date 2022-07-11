import PropTypes from 'prop-types';
import styles from "./Button.module.css"
import OnlineOrder from './OnlineOrder';
import SpinnerLoader from './SpinnerLoader';
import axios from "axios"
import { useState, useEffect } from 'react';
const ConfirmationModal = ({ handleCancel, action, RestaurantName, Data, inititalRoute }) => {

    const [spinner, setSpinner] = useState(false)
    const [selector, setSelector] = useState(null)

    useEffect(() => {
        if (inititalRoute)
            setSelector(true)
    }, [inititalRoute])

    async function submit() {
        try {
            setSpinner(true)
            const config = {
                headers: { 'X-Auth-Token': process.env.X_AUTH_TOKEN }
            };

            const body = {
                RestaurantName,
                action: action
            }

            const req = await axios.post("/api/users/get", body, config);
            const clientSecret = await req.data;

            if (clientSecret == "w") {
                setSpinner(false)
                handleCancel("Success")
            }

        } catch (error) {
            setSpinner(false)
            if ((error.response != undefined) && (error.response.data.errorMessage)) {
                handleCancel(error.response.data.errorMessage)
            } else
                handleCancel("Something went wrong")
        }
    }

    if (selector)
        return <OnlineOrder data={Data.OnlineMenu.items} currency={Data.OnlineMenu.Currency} handleCancel={handleCancel} RestaurantName={RestaurantName} />
    else
        return (
            <>
                <div onClick={() => handleCancel()} className={styles.backGround}></div>
                <section className={styles.popupBackground}>
                    {(!spinner) ?
                        ((selector == false) || (action != "order")) ?
                            <div className={styles.popupCard}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <p className={styles.cardTitle}>Confirmation</p>
                                    <button onClick={() => handleCancel()} className={styles.escape} />
                                </div>
                                <div style={{ height: "30%", flexDirection: "column", display: "flex", justifyContent: "space-around" }}>
                                    <p className={styles.cardOption}>Are you sure you want to call the waiter?</p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                                    <button onClick={() => handleCancel()} className={styles.popupCancelButton}>
                                        <p className={styles.popupCancelButtonText}>Cancel</p>
                                    </button>
                                    <button disabled={(action == "OrderCall") ? !Data.Options.OrderingWaiter : !Data.Options.CallWaiter} style={{ opacity: (action == "OrderCall") ? (Data.Options.OrderingWaiter) ? 1 : 0.5 : (Data.Options.CallWaiter) ? 1 : 0.5 }} className={styles.popupButton} onClick={() => submit()}>
                                        <p className={styles.popupButtonText}>Confirm</p>
                                    </button>
                                </div>
                            </div>
                            :
                            <div className={styles.popupCard} style={{ border: "1px solid #d8a761", padding: 0, borderRadius: "4%", justifyContent: "space-around" }}>
                                <div onClick={() => (Data.Options.OrderingWaiter) ? setSelector(false) : null} style={{ opacity: (Data.Options.OrderingWaiter) ? 1 : 0.5 }} className={styles.selectionIconPhone}>
                                    <i> <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 26, height: 30, position: "relative", top: -13 }} fill="currentColor" viewBox="0 0 16 16"> <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" /> </svg></i>
                                    <p>Call Waiter</p>
                                </div>
                                <div style={{ width: "92%", borderBottomWidth: "1px", borderColor: "#9d7640", borderRadius: "0%", alignSelf: "center", borderBottomStyle: "solid" }}></div>
                                <div onClick={() => (Data.Options.OrderingOnline) ? setSelector(true) : null} style={{ opacity: (Data.Options.OrderingOnline) ? 1 : 0.5 }} className={styles.selectionIconOnline}>
                                    <i><svg xmlns="http://www.w3.org/2000/svg" style={{ width: 30, height: 30, position: "relative", top: -13 }} fill="currentColor" viewBox="0 0 16 16"> <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z" /> </svg></i>
                                    <p>Order Online</p>
                                </div>

                            </div>
                        :
                        <SpinnerLoader />
                    }
                </section>
            </>
        )
}

ConfirmationModal.propTypes = {
    handleCancel: PropTypes.func,
    RestaurantName: PropTypes.string,
    action: PropTypes.string,
    Data: PropTypes.object
}

export default ConfirmationModal;