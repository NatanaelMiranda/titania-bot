import { Command } from "#base";
import { brBuilder } from "@magicyan/discord";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType, codeBlock
} from "discord.js";

new Command({
  name: "limpar",
  description: "Comando de limpar mensagens",
  dmPermission: false,
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: ["Administrator", ],
  options: [
    {
      name: "quantidade",
      description: "Quantidade de mensagens a serem limpas",
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: "author",
      description: "Limpar mensagens de apenas um author",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "mensagem",
      description: "Deletar uma mensagem especifica do canal",
      type: ApplicationCommandOptionType.String,
      required: false,
      autocomplete: true,
    },
  ],
  async autocomplete(interaction) {
    const { options, channel } = interaction;
    const focused = options.getFocused(true);

    switch (focused.name) {
      case "mensagem": {
        if (!channel?.isTextBased()) return;
        
        const messages = await channel.messages.fetch();
        const choices = Array.from(messages).map(
          ([id, { content, author, createdAt }]) => {
            const time = createdAt.toLocaleTimeString("pt-BR");
            const [hour, minute] = time.split(":");
            const text = `${hour}:${minute} ${author.displayName}: ${content}`;
            const name = text.length > 90 ? text.slice(0, 90) + "..." : text;
            return { name, value: id };
          }
        );

        const filtered = choices.filter(c => c.name.toLowerCase().includes(focused.value.toLowerCase()));
          interaction.respond(filtered.slice(0, 25));

        return;
      }
    }
  },
  async run(interaction) {
    const { options, channel } = interaction;

    await interaction.deferReply({ ephemeral });

    if (!channel?.isTextBased()) {
      interaction.editReply({
        content: "Não é possivel utilizar este comando nesse canal!",
      });
      return;
    }

    const amount = options.getInteger("quantidade") || 1;
    const mention = options.getMember("author");
    const messageId = options.getString("mensagem");

    if (messageId) {
      channel.messages
        .delete(messageId)
        .then(() =>
          interaction.editReply({
            content: "A mensagem foi deletada com sucesso!",
          })
        )
        .catch((err) =>
          interaction.editReply({
            content: brBuilder(
              "Não foi pssivel deletar a mensagem",
              codeBlock("ts", err)
            ),
          })
        );

      return;
    }

    if (mention) {
      const messages = await channel.messages.fetch();
      const filtered = messages.filter((m) => m.author.id == mention.id);
      channel
        .bulkDelete(filtered.first(Math.min(amount, 100)))
        .then((cleared) =>
          interaction.editReply({
            content: cleared.size
              ? `${cleared.size} mensagens de ${mention} deletadas com sucesso!`
              : `Não hã mensagens de ${mention} para serem deletadas!`,
          })
        )
        .catch((err) =>
          interaction.editReply({
            content: brBuilder(
              "Não foi possivel deletar mensagens",
              codeBlock("ts", err)
            ),
          })
        );

      return;
    }

    channel
      .bulkDelete(Math.min(amount, 100))
      .then((cleared) =>
        interaction.editReply({
          content: cleared.size
            ? `${cleared.size} mensagens deletadas com sucesso!`
            : "Não hã mensagens para serem deletadas!",
        })
      )
      .catch((err) =>
        interaction.editReply({
          content: brBuilder(
            "Não foi possivel deletar mensagens",
            codeBlock("ts", err)
          ),
        })
      );
  },
});
