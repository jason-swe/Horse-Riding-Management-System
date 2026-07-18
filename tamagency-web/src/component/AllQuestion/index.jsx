import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

import logo from '../../images/logo.png';
import background from '../../images/background.png';

const Home = () => {
    const navigate = useNavigate();

    // Create an array of 100 questions
    const questions = Array.from({ length: 100 }, (_, i) => i + 1);

    const handleQuestionClick = (id) => {
        navigate(`/question/${id}`);
    };

    return (
        <div
            className={styles.homeContainer}
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className={styles.logoContainer}>
                <img src={logo} alt="Logo" className={styles.logo} />
            </div>

            <div className={styles.gridContainer}>
                {questions.map((q) => (
                    <div
                        key={q}
                        className={styles.questionCircle}
                        onClick={() => handleQuestionClick(q)}
                    >
                        {q}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
