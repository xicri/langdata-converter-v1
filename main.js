import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import JSON5 from "json5";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/* ▼▼ Configuration ▼▼ */
const langdataPath = resolve(__dirname, "../genshin-langdata");
/* ▲▲ Configuration ▲▲ */

const dicDir = resolve(langdataPath, "dataset/dictionary");

const json5FileNames = await readdir(dicDir);

for (const json5FileName of json5FileNames) {
  const json5Path = resolve(dicDir, json5FileName);
  const json5Dic = await readFile(json5Path, { encoding: "utf-8" });

  const words = JSON5.parse(json5Dic)
    .map(word => {
      function splitWithSlash(translation) {
        if (translation?.includes("/")) {
          return translation
            .split("/")
            .map(t => t.trim());
        } else {
          return translation;
        }
      }

      return {
        slug: word.id,
        en: {
          translation: splitWithSlash(word.en),
          variants: word.variants?.en,
        },
        ja: {
          translation: splitWithSlash(word.ja),
          kana: splitWithSlash(word.pronunciationJa),
          variants: word.variants?.ja,
          note: word.notes,
        },
        zhCN: {
          translation: splitWithSlash(word.zhCN),
          variants: word.variants?.zhCN,
        },

        examples: word.examples?.map(example => ({
          en: {
            sentence: example.en,
          },
          ja: {
            sentence: example.ja,
            ref: example.ref,
            refURL: example.refURL,
          },
          zhCN: {
            sentence: example.zhCN,
          },
        })),

        tags: word.tags,
      };
    });

  await writeFile(json5Path, JSON5.stringify(words, { space: 2, quote: "\"" }));
}
