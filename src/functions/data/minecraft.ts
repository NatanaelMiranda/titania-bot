interface ServerStatusData {
  online: boolean;
  ip: string;
  port: number;
  hostname: string;
  version: string;
  icon: string;
  players: {
    online?: number;
    max?: number;
    list?: Array<{
      name: string;
      uuid: string;
    }>;
  };
}

interface FailServerStatusResponse {
  success: false;
}
interface SuccessStatusResponse {
  success: true;
  data: Partial<ServerStatusData>;
}

type ServerStatusResponse = FailServerStatusResponse | SuccessStatusResponse;

const baseUrl = {
java: "https://api.mcsrvstat.us/3/",
bedrock: "https://api.mcsrvstat.us/bedrock/3/"
};

export async function fetchMinecraftJavaServerStatus(
  ip: string
): Promise<ServerStatusResponse> {
  const response = await fetch(baseUrl.java + ip);

  if (response.status !== 200) {
    return { success: false };
  }
  const data = await response.json() as Partial<ServerStatusData>;
  return { success: true, data };
}

export async function fetchMinecraftBedrockServerStatus(
  ip: string
): Promise<ServerStatusResponse> {
  const response = await fetch(baseUrl.bedrock + ip);

  if (response.status !== 200) {
    return { success: false };
  }
  const data = await response.json() as Partial<ServerStatusData>;
  return { success: true, data };
}
