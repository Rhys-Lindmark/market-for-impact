export const cityIds = ['new-york-city','los-angeles','chicago','houston','denver','seattle','boston','atlanta','detroit'];
export const editionIds = ['california','usa',...cityIds];
export const canonicalBase = 'https://ai.rhyslindmark.com/givebetter';
export function editionPath(id) {
 if (!editionIds.includes(id)) return null;
 return '/'+id;
}
