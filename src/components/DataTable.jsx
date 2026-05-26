import React from "react";

const DataTable = ({ columns, data, emptyMessage = "No data available" }) => {
  return (
    <div style={{
      width: "100%",
      overflowX: "auto",
      borderRadius: "12px",
      border: "1px solid rgba(238, 231, 212, 0.2)",
      backgroundColor: "rgba(238, 231, 212, 0.05)",
      backdropFilter: "blur(8px)"
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
        color: "#EEE7D4",
        fontSize: "0.9rem"
      }}>
        <thead>
          <tr style={{
            backgroundColor: "rgba(238, 231, 212, 0.1)",
            borderBottom: "2px solid rgba(238, 231, 212, 0.2)"
          }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{
                padding: "16px",
                fontWeight: "600",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.05em"
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} style={{
                borderBottom: "1px solid rgba(238, 231, 212, 0.1)",
                transition: "background 160ms ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(238, 231, 212, 0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} style={{ padding: "16px" }}>
                  {col.render ? col.render(row) : row[col.field]}
                </td>
              ))}
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{
                padding: "40px",
                textAlign: "center",
                color: "rgba(238, 231, 212, 0.5)",
                fontStyle: "italic"
              }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
