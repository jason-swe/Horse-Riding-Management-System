import React from 'react';
import styles from './Detail.module.css';
import logo from '../../images/logo.png';
import data from './data.json';

const Detail = () => {
    return (
        <div className={styles.container}>
            <img src={logo} alt="TÂM Agency Logo" className={styles.logo} />

            <div className={styles.contentWrapper}>
                <div className={styles.numberWrapper}>
                    <h1 className={styles.numberText}>NUMBER {data.questionNumber}</h1>
                </div>

                <h2 className={styles.questionText}>{data.questionText}</h2>

                <div className={styles.answersContainer}>
                    {data.answers.map((answer) => (
                        <div key={answer.id} className={styles.answerButton}>
                            <div className={styles.answerLetter}>
                                {answer.id}
                            </div>
                            <div className={styles.answerText}>
                                {answer.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Detail;
