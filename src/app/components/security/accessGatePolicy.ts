type LocalAccessRuntime = {
  isDev: boolean;
  hostname: string;
};

export function shouldUseLocalAccess({ isDev, hostname }: LocalAccessRuntime) {
  return isDev || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}
