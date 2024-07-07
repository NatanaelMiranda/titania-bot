import { Command } from "#base";
import { fetchMinecraftJavaServerStatus, fetchMinecraftBedrockServerStatus, reply,  } from "#functions";
import { settings } from "#settings";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  inlineCode,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import {
  RenderCrops,
  RenderTypes,
  fetchSkinInfo,
  fetchSkinRender,
} from "starlightskinapi";

new Command({
  name: "minecraft",
  description: "Comando de minecraft",
  dmPermission: false,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "java",
      description: "Comandos de Minecraft Java.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "servidores",
          description: "Verificar status de um servidoir.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "ip",
              description: "Insira o ip do servidor",
              type: ApplicationCommandOptionType.String,
              required
            }
          ]
        },
        {
          name: "skins",
          description: "Buscar e exibir skin de um jogador.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "nick",
              description: "Insira o nick ou UUID",
              type: ApplicationCommandOptionType.String,
              required
            }
          ]
        }
      ]
    },
    {
      name: "bedrock",
      description: "Comando de Minecraft Bedrock ",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "servidores",
          description: "Verificar status de um servidor",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "ip",
              description: "Ip do servidor",
              type: ApplicationCommandOptionType.String,
              required,
            },
          ],
        },
        {
          name: "skins",
          description: "Buscar e exibir skin de um jogador.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "nick",
              description: "Insira o nick ou UUID",
              type: ApplicationCommandOptionType.String,
              required
            }
          ]
        }
      ],
    },
    
  ],
  async run(interaction) {
    const { options } = interaction;

    const group = options.getSubcommandGroup(true);
    const subCommand = options.getSubcommand(true);

    switch (group) {
      case "java": {
        switch (subCommand) {
          case "servidores": {
            const serverIp = options.getString("ip", true);

            await interaction.deferReply({ ephemeral });

            const response = await fetchMinecraftJavaServerStatus(serverIp);
            if (!response.success || !response.data.hostname) {
              interaction.editReply({
                content: `Não foram encontrados dados para o servidor com o ip: \`${serverIp}\``,
              });
              return;
            }

            const { data } = response;

            const ip = inlineCode(data.hostname || "Indisponivel");
            const numericIp = inlineCode(data.ip || "Indisponivel");
            const onlineStatus = data.online ? "👍" : "👎";
            const players = data.players?.max
              ? inlineCode(`${data.players?.online}/${data.players?.max}`)
              : "Indisponivel";
            const version = data.version || "Indisponivel";

            const embed = new EmbedBuilder({
              title: serverIp,
              color: hexToRgb(
                data.online
                  ? settings.colors.success
                  : settings.colors.danger
              ),
              thumbnail: { url: "attachment://thumb.png" },

              description: brBuilder(
                `online: ${onlineStatus}`,
                `IP: ${ip}`,
                `IP numérioco: ${numericIp}`,
                `jogadores: ${players}`,
                `Versão: ${version}`
              ),
            });

            const files: AttachmentBuilder[] = [];

            if (data.icon) {
              const base64string = data.icon.replace(
                "data:image/png;base64,",
                ""
              );
              const buffer = Buffer.from(base64string, "base64");
              files.push(new AttachmentBuilder(buffer, { name: "thumb.png" }));
            }

            interaction.editReply({ embeds: [embed], files });
            return;
          }
          
          case "skins": {
              await interaction.deferReply({ ephemeral });

              const nickOrUid = options.getString("nick", true);

              const results = await Promise.all([
                fetchSkinInfo(nickOrUid),
                fetchSkinRender(nickOrUid, {
                  type: RenderTypes.Head,
                  crop: RenderCrops.Full,
                }),
                fetchSkinRender(nickOrUid, {
                  type: RenderTypes.Dungeons,
                  crop: RenderCrops.Full,
                }),
                fetchSkinRender(nickOrUid, {
                  type: RenderTypes.Skin,
                  crop: RenderCrops.Default,
                }),
              ]);

              const [info, head, fullBory, skin] = results;

              if (
                !info.success ||
                !head.success ||
                !fullBory.success ||
                !skin.success
              ) {
                reply.danger({
                  interaction,
                  update: true,
                  text: brBuilder(
                    `Não foi possível obter skin de \`${nickOrUid}\``
                  ),
                });
                return;
              }

              const embed = new EmbedBuilder({
                color: hexToRgb(settings.colors.magic),
                description: brBuilder(
                  `# Skin de ${nickOrUid}`,
                  `Tamanho: **${info.skinTextureWidth}x${info.skinTextureHeight}**`
                ),
                author: { name: nickOrUid, iconURL: head.url },
                thumbnail: { url: head.url },
                image: { url: fullBory.url },
              });

              const row = createRow(
                new ButtonBuilder({
                  url: "https://namemc.com/profile/" + nickOrUid,
                  label: "NameMC",
                  emoji: "🪪",
                  style: ButtonStyle.Link,
                }),
                new ButtonBuilder({
                  url: skin.url,
                  label: "Baixar skin",
                  emoji: "⬇️",
                  style: ButtonStyle.Link,
                })
              );

              if (info.userCape) {
                row.addComponents(
                  new ButtonBuilder({
                    url: info.userCape,
                    label: "Baixar capa",
                    style: ButtonStyle.Link,
                  })
                );
              }

              interaction.editReply({ embeds: [embed], components: [row] });

              return;
            }
        }
        return;
      }

      case "bedrock": {
        switch (subCommand) {
          case "servidores": {
            const serverIp = options.getString("ip", true);

            await interaction.deferReply({ ephemeral });

            const response = await fetchMinecraftBedrockServerStatus(serverIp);
            if (!response.success || !response.data.hostname) {
              interaction.editReply({
                content: `Não foram encontrados dados para o servidor com o ip: \`${serverIp}\``,
              });
              return;
            }

            const { data } = response;

            const ip = inlineCode(data.hostname || "Indisponivel");
            const numericIp = inlineCode(data.ip || "Indisponivel");
            const onlineStatus = data.online ? "👍" : "👎";
            const players = data.players?.max
              ? inlineCode(`${data.players?.online}/${data.players?.max}`)
              : "Indisponivel";
            const version = data.version || "Indisponivel";

            const embed = new EmbedBuilder({
              title: serverIp,
              color: hexToRgb(
                data.online
                  ? settings.colors.success
                  : settings.colors.danger
              ),
              thumbnail: { url: "attachment://thumb.png" },

              description: brBuilder(
                `online: ${onlineStatus}`,
                `IP: ${ip}`,
                `IP numérioco: ${numericIp}`,
                `jogadores: ${players}`,
                `Versão: ${version}`
              ),
            });

            const files: AttachmentBuilder[] = [];

            if (data.icon) {
              const base64string = data.icon.replace(
                "data:image/png;base64,",
                ""
              );
              const buffer = Buffer.from(base64string, "base64");
              files.push(new AttachmentBuilder(buffer, { name: "thumb.png" }));
            }

            interaction.editReply({ embeds: [embed], files });

            return;
          }

          case "skins": {
            await interaction.deferReply({ ephemeral });

            const nickOrUid = options.getString("nick", true);

            const results = await Promise.all([
              fetchSkinInfo("." + nickOrUid),
              fetchSkinRender("." + nickOrUid, {
                type: RenderTypes.Head,
                crop: RenderCrops.Full,
              }),
              fetchSkinRender("." + nickOrUid, {
                type: RenderTypes.Dungeons,
                crop: RenderCrops.Full,
              }),
              fetchSkinRender("." + nickOrUid, {
                type: RenderTypes.Skin,
                crop: RenderCrops.Default,
              }),
            ]);

            const [info, head, fullBory, skin] = results;

            if (
              !info.success ||
              !head.success ||
              !fullBory.success ||
              !skin.success
            ) {
              reply.danger({
                interaction,
                update: true,
                text: brBuilder(
                  `Não foi possível obter skin de \`${nickOrUid}\``
                ),
              });
              return;
            }

            const embed = new EmbedBuilder({
              color: hexToRgb(settings.colors.magic),
              description: brBuilder(
                `# Skin de ${nickOrUid}`,
                `Tamanho: **${info.skinTextureWidth}x${info.skinTextureHeight}**`
              ),
              author: { name: nickOrUid, iconURL: head.url },
              thumbnail: { url: head.url },
              image: { url: fullBory.url },
            });

            const row = createRow(
              new ButtonBuilder({
                url: skin.url,
                label: "Baixar skin",
                emoji: "⬇️",
                style: ButtonStyle.Link,
              })
            );

            if (info.userCape) {
              row.addComponents(
                new ButtonBuilder({
                  url: info.userCape,
                  label: "Baixar capa",
                  style: ButtonStyle.Link,
                })
              );
            }

            interaction.editReply({ embeds: [embed], components: [row] });

            return;
          }
        }
        return;
      }

    }
  },
});
