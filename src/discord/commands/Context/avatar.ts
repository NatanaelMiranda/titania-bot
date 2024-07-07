import { Command } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import {
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember
} from "discord.js";

new Command({
  name: "Ver avatar",
  dmPermission: false,
  type: ApplicationCommandType.User,
  async run(interaction) {
    if (!interaction.isContextMenuCommand()) return;

    await interaction.deferReply({ ephemeral: true });

    const { targetMember } = interaction;
    const { user } = targetMember as GuildMember;

    if (!user) {
      await interaction.followUp("Usuário não encontrado.");
      return;
    }

    const embed = new EmbedBuilder();

    if (user.displayAvatarURL()) {
      embed.setTitle(`Avatar de ${user.username}`);
      embed.setImage(user.displayAvatarURL({ size: 256 }));
      embed.setColor(hexToRgb(settings.colors.success));
    } else {
      embed.setTitle("Usuário sem avatar");
      embed.setColor(hexToRgb(settings.colors.danger));
    }

    const button = createRow(
      new ButtonBuilder({ url: user.displayAvatarURL({ size: 256 }), label: "Abrir imagen no navegador", style: ButtonStyle.Link })
    );

    await interaction.editReply({ embeds: [embed], components: [button] });
  },
});
