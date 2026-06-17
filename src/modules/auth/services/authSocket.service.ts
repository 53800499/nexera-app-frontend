import { io, type Socket } from "socket.io-client";
import { env } from "@/shared/config/env";

type SessionRevokedHandler = () => void;

export class AuthSocketService {
  private socket: Socket | null = null;
  private onSessionRevoked: SessionRevokedHandler | null = null;

  connect(accessToken: string): void {
    if (typeof window === "undefined") return;

    this.disconnect();

    this.socket = io(typeof window !== "undefined" ? window.location.origin : env.apiBaseUrl, {
      path: "/socket.io",
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on("connect_error", () => {
      // Le backend peut ne pas exposer Socket.io encore — connexion silencieuse.
    });

    this.socket.on("auth:session_revoked", () => {
      this.onSessionRevoked?.();
    });

    this.socket.on("auth:force_logout", () => {
      this.onSessionRevoked?.();
    });
  }

  onRevoked(handler: SessionRevokedHandler): void {
    this.onSessionRevoked = handler;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const authSocket = new AuthSocketService();
