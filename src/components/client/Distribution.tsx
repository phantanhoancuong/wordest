import styles from "@/styles/components/Distribution.module.css";

/** Props for the {@link Distribution} component. */
interface DistributionProps {
  distribution: { data: number[]; legends: string[] };
}

const normalizeData = (data: number[], min: number = 1, max: number = 10) => {
  const maxNum = data.reduce((maxNum, currentNum) =>
    Math.max(maxNum, currentNum),
  );

  if (maxNum === 0) return data.map(() => min);

  return data.map((n) => Math.round((n / maxNum) * (max - min)) + min);
};

function Distribution({ distribution }: DistributionProps) {
  const normalizedData = normalizeData(distribution.data);

  return (
    <div className={styles["distribution__container"]}>
      {normalizedData.map((n, i) => (
        <div key={i} className={styles["distribution__row"]}>
          <span className={styles["legend"]}>
            {distribution.legends[i] ?? i + 1}
          </span>

          <div
            className={`${styles["distribution__bar"]} ${
              distribution.legends[i] === "Lost" ? styles["lost"] : ""
            }`}
            style={{ "--value": n } as React.CSSProperties}
          >
            <span className={styles["value"]}>{distribution.data[i]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Distribution;
