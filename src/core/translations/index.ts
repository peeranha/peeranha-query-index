import { getCommunityConfigLanguages } from 'src/core/sui-index/community';
import { log } from 'src/core/utils/logger';
import { translateItem } from 'src/core/utils/translate';

export const languages: { [x: string]: number } = {
  en: 0,
  zh: 1,
  es: 2,
  vi: 3,
};

const ENGLISH_LANGUAGE = 'en';

export async function getCommunityLanguages(
  itemLanguage: number,
  communityId: string
) {
  const languageCodes = Object.keys(languages);

  log(`Getting config for community with id ${communityId}`);
  const communityTranslations = await getCommunityConfigLanguages(communityId);

  if (communityTranslations.length === 0) {
    log(`Config for community ${communityId} does not exist.`);

    return [];
  }

  const sourceLanguage = languageCodes.find(
    (key) => languages[key] === itemLanguage
  );

  log(`Excluding source language of the item: ${sourceLanguage}`);
  const languagesForTranslate = communityTranslations
    .filter(
      (item) => item.enableAutotranslation && item.language !== sourceLanguage
    )
    .map((item) => item.language);

  if (
    sourceLanguage !== ENGLISH_LANGUAGE &&
    !languagesForTranslate.includes(ENGLISH_LANGUAGE)
  ) {
    languagesForTranslate.push(ENGLISH_LANGUAGE);
  }

  return languagesForTranslate;
}

export async function translateForumItem(
  communityId: string,
  itemLanguage: number,
  itemContent: string,
  itemTitle?: string
) {
  const communityTranslations = await getCommunityLanguages(
    itemLanguage,
    communityId
  );
  if (communityTranslations.length === 0) {
    log(`No one language was selected for translations`);
    return {};
  }

  log(`Languages for translate: ${communityTranslations.join(', ')}`);
  const languagesForTranslate: { [x: string]: number } = {};
  communityTranslations.forEach((item) => {
    languagesForTranslate[item] = languages[item]!;
  });

  const itemText = `${itemTitle || ''}\n${itemContent}`;

  const translationPromises: Promise<string>[] = [];
  Object.keys(languagesForTranslate).forEach((language) =>
    translationPromises.push(translateItem(itemText, language))
  );

  const translations = await Promise.all(translationPromises);
  const translationsData: {
    [language: string]: { title?: string; content: string };
  } = {};

  const languageCodes = Object.values(languagesForTranslate);
  languageCodes.forEach((code) => {
    const languageCode = languageCodes.indexOf(code);
    const translation = translations[languageCode]!;
    const separator = translation.indexOf('\n');

    const title = translation.substring(0, separator);
    const content = translation.substring(separator + 1);

    const translatedItemData = title !== '' ? { title, content } : { content };
    translationsData[code] = translatedItemData;
  });

  return translationsData;
}
