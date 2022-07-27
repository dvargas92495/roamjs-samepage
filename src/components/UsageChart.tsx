import React, { useEffect, useState } from "react";
import { Spinner } from "@blueprintjs/core";
import apiPost from "roamjs-components/util/apiPost";
import apiClient from "../apiClient";

const UsageChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    networks: 0,
    minutes: 0,
    messages: 0,
    date: "",
  });
  useEffect(() => {
    apiClient<typeof stats>({
      method: "usage",
    })
      .then((r) => setStats(r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [setStats, setLoading, setError]);
  return (
    <div style={{ minWidth: 360 }}>
      <div style={loading ? { opacity: 0.5 } : {}}>
        <div className={"flex justify-between items-center"}>
          <b>Description</b>
          <span>
            <b style={{ minWidth: 80, display: "inline-block" }}>Price</b>
            <b style={{ minWidth: 80, display: "inline-block" }}>Qty</b>
            <b style={{ minWidth: 80, display: "inline-block" }}>Total</b>
          </span>
        </div>
        <div className={"flex justify-between items-center"}>
          <span>Mins Conn.</span>
          <span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              $0.002
            </span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              {stats.minutes.toFixed(2)}
            </span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              ${(stats.minutes * 0.002).toFixed(2)}
            </span>
          </span>
        </div>
        <div className={"flex justify-between items-center"}>
          <span>Messages</span>
          <span>
            <span style={{ minWidth: 80, display: "inline-block" }}>$0.01</span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              {stats.messages.toFixed(2)}
            </span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              ${(stats.messages * 0.01).toFixed(2)}
            </span>
          </span>
        </div>
        <div className={"flex justify-between items-center"}>
          <span>Networks</span>
          <span>
            <span style={{ minWidth: 80, display: "inline-block" }}>$1</span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              {stats.networks}
            </span>
            <span style={{ minWidth: 80, display: "inline-block" }}>
              ${stats.networks.toFixed(2)}
            </span>
          </span>
        </div>
        <hr />
        <div className={"flex justify-between items-center"}>
          <span>
            <b>Total</b> {stats.date && `(Billed: ${stats.date})`}
          </span>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ minWidth: 160 }}>
              {loading && <Spinner size={16} />}
            </span>
            <b style={{ minWidth: 80, display: "inline-block" }}>
              $
              {(
                stats.minutes * 0.002 +
                stats.messages * 0.01 +
                stats.networks
              ).toFixed(2)}
            </b>
          </span>
        </div>
      </div>
      <div style={{ color: "darkred" }}>{error}</div>
    </div>
  );
};

export default UsageChart;
