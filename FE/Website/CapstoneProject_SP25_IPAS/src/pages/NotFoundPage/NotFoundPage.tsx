import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.notFoundContainer}>
            <div className={styles.content}>
                <h1>404</h1>
                <h2>Oops! Page Not Found</h2>
                <p>The page you are looking for might have been removed or is temporarily unavailable.</p>
                <Button type="primary" className={styles.homeButton} onClick={() => navigate("/")}>
                    Go Home
                </Button>
            </div>
        </div>
    );
};

export default NotFoundPage;
