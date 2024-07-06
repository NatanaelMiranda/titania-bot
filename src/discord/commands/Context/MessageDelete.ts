import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";

new Command({
  name: "apagar mensagem",
  dmPermission: false,
  type: ApplicationCommandType.Message,
  async run(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const { targetMessage } = interaction;

    await targetMessage.delete().catch((reason) => console.log(reason));

    interaction.reply({ephemeral: true, content: "A mensagem foi deletada!" });
  },
});
