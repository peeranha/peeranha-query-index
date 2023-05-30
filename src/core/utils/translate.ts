import { Translate } from 'aws-sdk';
import { ConfigurationError } from 'src/core/errors';

const UNTRANSLATED_TOKEN = '<UT>';

const TranslateClientConfiguration: Translate.ClientConfiguration = {
  region: process.env.REGION,
};
if (process.env.ENV === 'offline') {
  if (!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)) {
    throw new ConfigurationError(
      `AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY are missing in the env config`
    );
  }

  TranslateClientConfiguration.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const client = new Translate(TranslateClientConfiguration);

function removeUntranslatedTexts(text: string) {
  const untranslatedTexts: string[] = [];

  const re = /(```[\s\S]*```)|(-{3,})|(`.+`)/g;
  const mathces = [...text.matchAll(re)];

  let textForTranslate = text;

  for (let i = 0; i < mathces.length; i++) {
    const untranslatedText = mathces[i]![0];

    untranslatedTexts.push(untranslatedText);

    textForTranslate = textForTranslate.replace(
      untranslatedText,
      UNTRANSLATED_TOKEN
    );
  }

  return { textForTranslate, untranslatedTexts };
}

function addUntranslatedTexts(text: string, untranslatedTexts: string[]) {
  let result = text;
  for (let i = 0; i < untranslatedTexts.length; i++) {
    result = result.replace(UNTRANSLATED_TOKEN, untranslatedTexts[i] as string);
  }
  return result
    .replace(/\\ n/g, '\n')
    .replace(/\] \(/g, '](')
    .replace(/(! \[|！\[)/g, '![')
    .replace(/- ?\[ ?\]/g, '- [ ]')
    .replace(/( \*\*|\*\* )/g, '**')
    .replace(/( ~~|~~ )/g, '~~')
    .replace(/。/g, '. ');
}

export async function translateItem(text: string, to: string) {
  const separator = text.indexOf('\n');

  const parsedContent = removeUntranslatedTexts(text.substring(separator + 1));
  const textForTranslate = `${text.substring(0, separator)}\n${
    parsedContent.textForTranslate
  }`;

  const response = await client
    .translateText({
      Text: textForTranslate,
      SourceLanguageCode: 'auto',
      TargetLanguageCode: to,
    })
    .promise();

  const translatedItem = addUntranslatedTexts(
    response.TranslatedText,
    parsedContent.untranslatedTexts
  );

  return translatedItem;
}
