import {test,expect} from '@playwright/test';
import selection from '../data/edition-featured.json' with {type:'json'};

const editions=['san-francisco',...Object.entries(selection.editions).filter(([,entry])=>entry.status==='accepted').map(([id])=>id)];
for(const edition of editions){
  test(`${edition} top four retain sourced accessible images without captions`,async({page})=>{
    await page.goto('/'+edition);
    const cards=page.locator('.sf-home-charity');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('figcaption')).toHaveCount(0);
    for(const card of await cards.all()){
      await expect(card.locator('figure a')).toHaveAttribute('href',/^https:\/\//);
      await expect(card.locator('figure img')).toHaveAttribute('alt',/\S/);
      await expect(card.getByRole('link',{name:'Full research report'})).toHaveCount(1);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
