import styles from "./Button.module.css"

const SpinnerLoader = () => {
    return (
        <div className={styles.spinner}>
            <div className={`${styles.blob} ${styles.top}`}></div>
            <div className={`${styles.blob} ${styles.bottom}`}></div>
            <div className={`${styles.blob} ${styles.left}`}></div>
            <div className={`${styles.blob} ${styles.moveBlob}`}></div>
        </div>
    )
}

export default SpinnerLoader;