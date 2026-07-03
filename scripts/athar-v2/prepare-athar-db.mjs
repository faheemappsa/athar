const MAX_ITEM_LENGTH = 150;

const normalizeText = (text) => String(text || "").replace(/\s+/g, " ").trim();

export const prepareAtharDbItems = (items) =>
  items
    .map((item) => {
      const text = normalizeText(item.text);
      return {
        ...item,
        text,
        normalizedText: text.normalize("NFKC"),
        length: text.length,
        verified: Boolean(item.source?.title && item.source?.reference && text.length <= MAX_ITEM_LENGTH),
      };
    })
    .filter((item) => item.verified);

export const ATHAR_DB_BUILD_RULES = {
  maxItemLength: MAX_ITEM_LENGTH,
  displaySource: "local_static_db",
  liveExternalDisplay: false,
};
