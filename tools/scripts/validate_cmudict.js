#!/usr/bin/env node
import fs from "fs";
import path from "path";

const dictPath = path.resolve("public/dicts/cmudict.min.json");

const sampleWords = [
  "EXAMPLE",
  "SCHOOLOMANCE",
  "RHYTHM",
  "AETHER",
  "SPELL",
  "ANALYZE",
  "CRYPT",
  "MAGIC",
  "PHONEME",
  "INCANTATION",
  "RUNNING",
  "BROKEN",
  "FIRE",
  "PSYCHIC",
  "VOID",
  "ALCHEMY",
  "WILL",
  "SONIC",
];

function main() {
  if (!fs.existsSync(dictPath)) {
    console.error(`Missing dictionary at ${dictPath}. Run convert_cmudict.js first.`);
    process.exit(1);
  }

  const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"));
  let misses = 0;

  sampleWords.forEach((word) => {
    const entry = dict[word];
    if (!entry) {
      misses += 1;
      console.log(`MISS ${word}`);
      return;
    }
    const vfLast = entry.vf?.[entry.vf.length - 1] || "UH";
    const coda = entry.cd?.length ? entry.cd.join("") : "open";
    console.log(`OK ${word} -> ${vfLast}-${coda}`);
  });

  console.log(`Sampled ${sampleWords.length} words, misses: ${misses}`);
}

main();
