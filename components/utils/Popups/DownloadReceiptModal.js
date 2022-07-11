import { useState } from "react"
import PropTypes from 'prop-types';
import styles from "./Button.module.css"
import axios from "axios"
import SpinnerLoader from "./SpinnerLoader";

const ReceiptModal = ({ handleCancel, RestaurantName }) => {

    const [spinner, setSpinner] = useState(false)

    const submit = async () => {
        try {
            setSpinner(true)

            const config = {
                headers: {
                    'X-Auth-Token': process.env.X_AUTH_TOKEN,
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                },
                responseType: "blob"
            };
            const body = {
                RestaurantName,
                action: "DownloadReceipt"
            }

            const req = await axios.post("/api/users/downloadBill", body, config);
            const res = await req.data;

            const buffer = res
            const blob = new Blob([buffer]);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'invoice.pdf';
            link.click();
            setSpinner(false)
            handleCancel()


        } catch (error) {
            setSpinner(false)
            if (error.response.data.errorMessage) {
                handleCancel(error.response.data.errorMessage)
            } else
                handleCancel("Something went wrong")
        }
    }

    return (
        <>
            <div onClick={() => handleCancel()} className={styles.backGround}></div>
            <section className={styles.popupBackground}>
                {(!spinner) ?
                    <div className={styles.popupCard} style={{ height: "210px" }} >
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <p className={styles.cardTitle}>Bill</p>
                            <button onClick={() => handleCancel()} className={styles.escape} />
                        </div>

                        <div style={{ height: "30%", marginBottom: 10, flexDirection: "column", display: "flex", justifyContent: "space-around" }}>
                            <p className={styles.cardOption} style={{ fontStyle: "italic", opacity: 0.8 }}>You may download the bill upon recieving the waiter confirmation or a website notification</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                            <button onClick={() => handleCancel()} className={styles.popupCancelButton}>
                                <p className={styles.popupCancelButtonText}>Cancel</p>
                            </button>
                            <button onClick={() => submit()} className={styles.popupButton}>
                                <p className={styles.popupButtonText}>Download</p>
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
}

export default ReceiptModal;