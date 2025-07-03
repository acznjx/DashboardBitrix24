import React from "react";

interface CardInfoProps {
  title: string;
  value: string | number;
  bgColor: string;
}

const CardInfo: React.FC<CardInfoProps> = ({ title, value, bgColor }) => {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: "1rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: bgColor,
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
};

export default CardInfo;
