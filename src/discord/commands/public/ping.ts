import { Command } from "#base";
import { reply } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

new Command({
  name: "ping",
  description: "Verifique o ping do bot",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const { client, user } = interaction;

    const ping = client.ws.ping;
    const name = user.username;

    reply.primary({
      interaction,
      text: brBuilder(`Olá ${name}, O ping do bot é: ${ping}`),
    });
  },
});
