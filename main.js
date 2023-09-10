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

      function removeUndefinedProps(obj) {
        const newObj = {};

        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === "object") {
            newObj[key] = removeUndefinedProps(obj[key]);
          } else if (obj[key] !== undefined) {
            newObj[key] = obj[key];
          }
        });

        return newObj;
      }

      return removeUndefinedProps({
        slug: word.id,
        en: {
          word: splitWithSlash(word.en),
          variants: word.variants?.en,
        },
        ja: {
          word: splitWithSlash(word.ja),
          kana: splitWithSlash(word.pronunciationJa),
          note: word.notes,
          variants: word.variants?.ja,
        },
        "zh-CN": {
          word: splitWithSlash(word.zhCN),
          pinyins: word.pinyins,
          note: word.notesZh,
          variants: word.variants?.zhCN,
        },

        examples: word.examples?.map(example => ({
          en: example.en,
          ja: example.ja,
          "zh-CN": example.zhCN,
          refs: [{
            title: example.ref,
            url: example.refURL,
          }],
        })),

        tags: word.tags,
        _meta: word._meta,
      });
    });

  await writeFile(json5Path, JSON5.stringify(words, { space: 2, quote: "\"" }));
}
