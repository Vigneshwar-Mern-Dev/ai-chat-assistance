"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { DASHBOARD_API_TOKEN, SOCKET_URL, apiRequest } from "@/lib/api";

const DashboardContext = createContext(null);

const emptySnapshot = {
  status: {
    value: "disconnected",
    qrCode: null,
    connectedAt: null,
    lastError: null,
    clientName: null,
    phoneNumber: null
  },
  settings: {
    aiEnabled: false,
    typingSimulation: true,
    replyDelayMinSeconds: 5,
    replyDelayMaxSeconds: 15,
    customPrompt: ""
  },
  session: {
    hasLocalSession: false,
    reconnectAttempts: 0,
    lastActionAt: null
  },
  meta: {
    lastSnapshotAt: null,
    lastChatSyncAt: null,
    lastMessageAt: null,
    pendingReplies: []
  },
  chats: [],
  recentMessages: [],
  stats: {
    totalChats: 0,
    unreadChats: 0,
    aiRepliedCount: 0,
    pendingReplies: 0
  }
};

export function DashboardProvider({ children }) {
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSnapshot() {
      try {
        const response = await apiRequest("/api/app");
        if (mounted && response.snapshot) {
          setSnapshot(response.snapshot);
          setLoading(false);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message);
          setLoading(false);
        }
      }
    }

    loadSnapshot();

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: DASHBOARD_API_TOKEN ? { token: DASHBOARD_API_TOKEN } : undefined
    });

    socket.on("app:snapshot", (nextSnapshot) => {
      if (mounted && nextSnapshot) {
        setError("");
        setSnapshot(nextSnapshot);
        setLoading(false);
      }
    });

    socket.on("connect_error", () => {
      if (mounted) {
        setError(`Could not connect to realtime server at ${SOCKET_URL}`);
      }
    });

    return () => {
      mounted = false;
      socket.close();
    };
  }, []);

  async function runAction(actionKey, requestPath, options) {
    setSubmitting(actionKey);
    setError("");

    try {
      const response = await apiRequest(requestPath, options);
      if (response.snapshot) {
        setSnapshot(response.snapshot);
      }
      return response;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setSubmitting("");
    }
  }

  const value = {
    snapshot,
    loading,
    error,
    submitting,
    actions: {
      refresh: () => runAction("refresh", "/api/app"),
      updateSettings: (payload) =>
        runAction("settings", "/api/settings", {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
      reconnect: () => runAction("session", "/api/session/reconnect", { method: "POST" }),
      regenerateQr: () => runAction("session", "/api/session/regenerate-qr", { method: "POST" }),
      logout: () => runAction("session", "/api/session/logout", { method: "POST" }),
      resetSession: () => runAction("session", "/api/session/reset", { method: "POST" })
    }
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }

  return context;
}
