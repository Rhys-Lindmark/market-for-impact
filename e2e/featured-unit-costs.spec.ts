import {test,expect} from '@playwright/test';
import selection from '../data/edition-featured.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import {nativeUnitForReport,nativeUnitForSF} from '../lib/featured-unit-costs.mjs';
import {formatImpactPrice} from '../lib/impact-metric.mjs';
import {reportPrice} from '../lib/geography-reports.mjs';

const sf=['recares','self-help-for-the-elderly','hope-pacifica','project-homeless-connect'];
const expected:Record<string,ReturnType<typeof nativeUnitForSF>[]>={'san-francisco':sf.map(nativeUnitForSF)};
for(const [edition,entry]of Object.entries(selection.editions))expected[edition]=entry.slugs.map(slug=>nativeUnitForReport(reports.reports.find(r=>r.edition===edition&&r.slug===slug)));
for(const [edition,estimates]of Object.entries(expected)){
  test(`${edition} displays concrete unit costs without changing DALYs or reintroducing captions`,async({page})=>{
    await page.goto('/'+edition);
    const cards=page.locator('.sf-home-charity');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('figcaption')).toHaveCount(0);
    for(let i=0;i<estimates.length;i++){
      const estimate=estimates[i],card=cards.nth(i),unit=card.locator('[data-native-unit]');
      if(estimate.priceUSD===null){await expect(unit).toHaveCount(0);await expect(card).toContainText('per DALY');continue;}
      await expect(unit.locator('strong')).toHaveText(estimate.line);
      await expect(unit).toHaveAttribute('data-native-price',String(estimate.priceUSD));
      await expect(unit).toContainText(estimate.basis);
      await unit.locator('summary').click();
      await expect(unit.locator('[data-native-calculation]')).toContainText('÷');
      const calculation=await unit.locator('[data-native-calculation]').textContent();
      const displayedUnits=calculation!.match(/÷\s+([\d,.]+)/)![1];
      expect(Number(displayedUnits.replaceAll(',',''))).toBeGreaterThan(0);
      await expect(unit).toContainText(estimate.scope);
      await expect(unit.getByRole('link',{name:'Report assumptions'})).toHaveAttribute('href',/^https:\/\/ai\.rhyslindmark\.com\/givebetter\//);
      await unit.locator('summary').click();
      if(edition!=='san-francisco'){
        const report=reports.reports.find(r=>r.edition+'/'+r.slug===estimate.key)!;
        await expect(card).toContainText(formatImpactPrice(reportPrice(report))+' per DALY');
      }
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
