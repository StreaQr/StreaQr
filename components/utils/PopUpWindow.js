import PropTypes from 'prop-types';
import dynamic from "next/dynamic";
const ReceiptModal = dynamic(import("./Popups/ReceiptModal"))
const ConfirmationModal = dynamic(import("./Popups/ConfirmationModal"))
const RateModal = dynamic(import("./Popups/RateModal"))
const DownloadReceiptModal = dynamic(import("./Popups/DownloadReceiptModal"))

const PopUpWindow = ({ handleCancel, popUp, RestaurantName, Data }) => {
    return (
        <>
            {(popUp === "Receipt") ?
                <ReceiptModal RestaurantName={RestaurantName} Data={Data.Options} handleCancel={handleCancel} />
                : (popUp === "CallWaiter") ?
                    <ConfirmationModal RestaurantName={RestaurantName} Data={Data} handleCancel={handleCancel} action={"callWaiter"} />
                    : (popUp === "OrderCall") ?
                        <ConfirmationModal RestaurantName={RestaurantName} Data={Data} handleCancel={handleCancel} action={"order"} />
                        : (popUp === "Rating") ?
                            <RateModal RestaurantName={RestaurantName} Data={Data.Options.WaiterRating} handleCancel={handleCancel} />
                            : (popUp === "DownloadReceipt") ?
                                <DownloadReceiptModal RestaurantName={RestaurantName} handleCancel={handleCancel} />
                                : (popUp === "OrderCallOnline") ?
                                    <ConfirmationModal RestaurantName={RestaurantName} Data={Data} handleCancel={handleCancel} action={"order"} inititalRoute={true} />
                                    :
                                    null
            }
        </>
    )
}

PopUpWindow.propTypes = {
    handleButtonSelection: PropTypes.func,
    ReceiptTypeSelection: PropTypes.object,
    RestaurantName: PropTypes.string,
    Data: PropTypes.object
}

export default PopUpWindow;